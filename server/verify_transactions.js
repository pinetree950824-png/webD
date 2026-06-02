const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log("=== Running Marketplace Transaction Verification ===");
  
  // 1. Initialize in-memory DB
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON;');
  
  // 2. Load schema
  const schemaPath = path.join(__dirname, 'src/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.exec(schemaSql);
  
  // 3. Insert mock data
  // User 1 (Seller): 1000 Gold
  // User 2 (Buyer): 500 Gold (Insufficient)
  // User 3 (Buyer): 2000 Gold (Sufficient)
  await db.run("INSERT INTO users (id, nickname, gold) VALUES (1, 'Seller_Seto', 1000)");
  await db.run("INSERT INTO users (id, nickname, gold) VALUES (2, 'Buyer_Yugi_Poor', 500)");
  await db.run("INSERT INTO users (id, nickname, gold) VALUES (3, 'Buyer_Kaiba_Rich', 2000)");
  
  // Insert 1 card in library
  await db.run("INSERT INTO cards (id, name, rarity, booster_pack, image_url) VALUES (100, '푸른 눈의 백룡', 'Overframe Rare', 'Test Pack', 'url_test')");
  
  // Seller owns this card
  await db.run("INSERT INTO user_cards (id, user_id, card_id) VALUES (500, 1, 100)");
  
  // List card for 1200 Gold
  await db.run("INSERT INTO marketplace (id, user_card_id, seller_id, price, is_active) VALUES (10, 500, 1, 1200, 1)");
  
  console.log("✔ Mock database seeded successfully.");

  // --- CASE 1: Purchase fails due to insufficient funds (User 2) ---
  console.log("\n--- Testing Case 1: Insufficient Gold ---");
  const buyerPoorId = 2;
  const listingId = 10;
  
  await db.run('BEGIN TRANSACTION');
  try {
    const listing = await db.get('SELECT * FROM marketplace WHERE id = ? AND is_active = 1', [listingId]);
    const buyer = await db.get('SELECT gold FROM users WHERE id = ?', [buyerPoorId]);
    
    if (buyer.gold < listing.price) {
      throw new Error(`Insufficient gold: user has ${buyer.gold}, card costs ${listing.price}`);
    }
    
    // Attempt trade
    await db.run('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, buyerPoorId]);
    await db.run('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, listing.seller_id]);
    await db.run('UPDATE user_cards SET user_id = ? WHERE id = ?', [buyerPoorId, listing.user_card_id]);
    await db.run('UPDATE marketplace SET is_active = 0 WHERE id = ?', [listingId]);
    
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    console.log("✔ Transaction rolled back as expected. Reason:", err.message);
  }
  
  // Assert Case 1 states
  const sellerGold1 = await db.get('SELECT gold FROM users WHERE id = 1');
  const buyerPoorGold1 = await db.get('SELECT gold FROM users WHERE id = 2');
  const cardOwner1 = await db.get('SELECT user_id FROM user_cards WHERE id = 500');
  const listingStatus1 = await db.get('SELECT is_active FROM marketplace WHERE id = 10');
  
  if (sellerGold1.gold === 1000 && buyerPoorGold1.gold === 500 && cardOwner1.user_id === 1 && listingStatus1.is_active === 1) {
    console.log("✔ Case 1 Verification PASSED: DB state unchanged.");
  } else {
    console.error("❌ Case 1 Verification FAILED: State corrupted!");
  }

  // --- CASE 2: Purchase succeeds with sufficient funds (User 3) ---
  console.log("\n--- Testing Case 2: Successful Trade ---");
  const buyerRichId = 3;
  
  await db.run('BEGIN TRANSACTION');
  try {
    const listing = await db.get('SELECT * FROM marketplace WHERE id = ? AND is_active = 1', [listingId]);
    const buyer = await db.get('SELECT gold FROM users WHERE id = ?', [buyerRichId]);
    
    if (buyer.gold < listing.price) {
      throw new Error(`Insufficient gold`);
    }
    
    // Execute trade
    await db.run('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, buyerRichId]);
    await db.run('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, listing.seller_id]);
    await db.run('UPDATE user_cards SET user_id = ? WHERE id = ?', [buyerRichId, listing.user_card_id]);
    await db.run('UPDATE marketplace SET is_active = 0 WHERE id = ?', [listingId]);
    
    await db.run('COMMIT');
    console.log("✔ Transaction committed successfully!");
  } catch (err) {
    await db.run('ROLLBACK');
    console.error("❌ Case 2 Transaction failed:", err.message);
  }
  
  // Assert Case 2 states
  const sellerGold2 = await db.get('SELECT gold FROM users WHERE id = 1');
  const buyerRichGold2 = await db.get('SELECT gold FROM users WHERE id = 3');
  const cardOwner2 = await db.get('SELECT user_id FROM user_cards WHERE id = 500');
  const listingStatus2 = await db.get('SELECT is_active FROM marketplace WHERE id = 10');
  
  if (
    sellerGold2.gold === 2200 && // 1000 + 1200
    buyerRichGold2.gold === 800 && // 2000 - 1200
    cardOwner2.user_id === 3 &&    // Transferred to Buyer
    listingStatus2.is_active === 0 // Deactivated listing
  ) {
    console.log("✔ Case 2 Verification PASSED: DB state updated correctly.");
  } else {
    console.error("❌ Case 2 Verification FAILED: Balances or ownership incorrect!");
    console.log("Seller:", sellerGold2.gold, "Buyer:", buyerRichGold2.gold, "Owner:", cardOwner2.user_id, "Listing:", listingStatus2.is_active);
  }
  
  await db.close();
  console.log("=== Verification Complete ===");
}

runTests().catch(err => console.error(err));
