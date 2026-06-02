const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const seedCards = require('./seedData');

let db = null;

async function getDB() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/db.sqlite');
  const dbDir = path.dirname(dbPath);
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON;');

  return db;
}

async function initDB() {
  const database = await getDB();
  
  // Check if cards table exists
  const tableCheck = await database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='cards';");
  
  if (!tableCheck) {
    console.log("Database empty. Creating tables...");
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await database.exec(schemaSql);
    console.log("Database tables created successfully.");
  }

  // Check if cards table is seeded
  const cardCount = await database.get("SELECT COUNT(*) as count FROM cards;");
  if (cardCount.count === 0) {
    console.log("Seeding card database...");
    const stmt = await database.prepare(`
      INSERT INTO cards (name, rarity, booster_pack, image_url, card_type, level, attribute, attack, defense, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const card of seedCards) {
      await stmt.run(
        card.name,
        card.rarity,
        card.booster_pack,
        card.image_url,
        card.card_type,
        card.level !== undefined ? card.level : null,
        card.attribute || null,
        card.attack !== undefined ? card.attack : null,
        card.defense !== undefined ? card.defense : null,
        card.description || ''
      );
    }
    await stmt.finalize();
    console.log(`Seeded ${seedCards.length} cards successfully.`);
  } else {
    console.log("Card database already seeded.");
  }
}

module.exports = {
  getDB,
  initDB
};
