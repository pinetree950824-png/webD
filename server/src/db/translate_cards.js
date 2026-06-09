require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const PACKS = [
  {
    url: 'https://ygoprodeck.com/pack/?search=Limit%20Over%20Collection%3A%20The%20Heroes&region=OCG',
    set_name: 'Limit Over Collection -THE HEROES-'
  },
  {
    url: 'https://ygoprodeck.com/pack/?search=Limit%20Over%20Collection%3A%20The%20Rivals&region=OCG',
    set_name: 'Limit Over Collection -THE RIVALS-'
  },
  {
    url: 'https://ygoprodeck.com/pack/?search=Chaos%20Origins&region=OCG',
    set_name: 'Chaos Origins'
  }
];

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} when fetching ${url}`);
  return await res.text();
}

async function fetchCardDetails(ids) {
  const chunkSize = 50;
  let allData = [];
  
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${chunk.join(',')}`;
    
    console.log(`  Fetching batch of ${chunk.length} cards from YGOPRODeck API...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  Failed to fetch batch starting at index ${i}. Skipping chunk...`);
      continue;
    }
    const json = await res.json();
    if (json && json.data) {
      allData = allData.concat(json.data);
    }
    await sleep(200);
  }
  return allData;
}

async function getKoreanTranslation(englishName) {
  try {
    // 1. Search card in English locale to find CID
    const searchUrl = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&keyword=${encodeURIComponent(englishName)}&request_locale=en`;
    const searchHtml = await fetchHtml(searchUrl);
    const $search = cheerio.load(searchHtml);
    
    let cid = null;
    const inputs = $search('input.cid');
    
    if (inputs.length === 1) {
      cid = $search(inputs[0]).val();
    } else if (inputs.length > 1) {
      inputs.each((i, el) => {
        const curCid = $search(el).val();
        const curCnm = $search(el).siblings('input.cnm').val();
        if (curCnm && curCnm.toLowerCase().trim() === englishName.toLowerCase().trim()) {
          cid = curCid;
        }
      });
      if (!cid) {
        cid = $search(inputs[0]).val();
      }
    }
    
    if (!cid) {
      return null;
    }
    
    // 2. Query Korean detail page with CID
    const detailUrl = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cid}&request_locale=ko`;
    const detailHtml = await fetchHtml(detailUrl);
    const $detail = cheerio.load(detailHtml);
    
    const nameRaw = $detail('#cardname h1').text().trim();
    const koName = nameRaw.split('\n')[0].trim();
    
    const descEl = $detail('.item_box_text').clone();
    descEl.find('.text_title').remove();
    descEl.find('br').replaceWith('\n');
    const koDesc = descEl.text().split('\n').map(line => line.trim()).filter(line => line).join('\n');
    
    if (koName && koDesc) {
      return { name: koName, description: koDesc };
    }
  } catch (err) {
    console.error(`  Error translating "${englishName}":`, err.message);
  }
  return null;
}

async function start() {
  console.log('=== Starting Card Set Crawler with Korean Translations ===');
  const allCardsToSeed = [];
  
  for (const pack of PACKS) {
    console.log(`\nCrawling pack: ${pack.set_name}`);
    console.log(`URL: ${pack.url}`);
    
    try {
      const html = await fetchHtml(pack.url);
      const $ = cheerio.load(html);
      
      const parsedIds = [];
      const idToRarity = {};
      
      $('h2.card-grid-header').each((index, headerEl) => {
        // Use the raw rarity text as it is on the website
        const rarityText = $(headerEl).find('.card-grid-header-content').text().split('•')[0].trim();
        
        // Find next div sibling containing figures
        const container = $(headerEl).next('div');
        container.find('figure').each((j, figEl) => {
          const cardId = $(figEl).find('img').attr('data-name');
          if (cardId && !parsedIds.includes(cardId)) {
            parsedIds.push(cardId);
            idToRarity[cardId] = rarityText;
          }
        });
      });
      
      console.log(`  Found ${parsedIds.length} card IDs in HTML.`);
      if (parsedIds.length === 0) continue;
      
      // Fetch details from API
      const details = await fetchCardDetails(parsedIds);
      console.log(`  Retrieved details for ${details.length} cards from API.`);
      
      // Translate each card
      console.log(`  Translating ${details.length} cards...`);
      let count = 0;
      for (const card of details) {
        count++;
        const isMonster = !card.type.toLowerCase().includes('spell') && !card.type.toLowerCase().includes('trap');
        
        console.log(`  [${count}/${details.length}] Translating: "${card.name}"...`);
        
        // Get Korean translation
        const translation = await getKoreanTranslation(card.name);
        
        const finalName = translation ? translation.name : card.name;
        const finalDesc = translation ? translation.description : (card.desc || '');
        
        if (translation) {
          console.log(`    -> Translated to: "${finalName}"`);
        } else {
          console.log(`    -> Fallback to English (translation not found/error)`);
        }
        
        allCardsToSeed.push({
          name: finalName,
          rarity: idToRarity[card.id] || 'Common',
          booster_pack: pack.set_name,
          image_url: `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
          card_type: !isMonster ? (card.type.toLowerCase().includes('spell') ? 'Spell' : 'Trap') : 'Monster',
          level: isMonster ? (card.level || null) : null,
          attribute: isMonster ? (card.attribute || null) : null,
          attack: isMonster ? (card.atk !== undefined ? card.atk : null) : null,
          defense: isMonster ? (card.def !== undefined ? card.def : null) : null,
          description: finalDesc
        });
        
        // Delay to prevent rate-limiting on official site
        await sleep(350);
      }
      
    } catch (err) {
      console.error(`Error processing pack ${pack.set_name}:`, err.message);
    }
  }
  
  console.log(`\nTotal cards collected to seed: ${allCardsToSeed.length}`);
  
  if (allCardsToSeed.length === 0) {
    console.error('No card data collected. Aborting database rewrite.');
    return;
  }
  
  // 1. Write to seedData.js
  const seedDataPath = path.join(__dirname, 'seedData.js');
  const fileContent = `// Auto-generated Card Seed Data via crawler
const seedCards = ${JSON.stringify(allCardsToSeed, null, 2)};

module.exports = seedCards;
`;
  fs.writeFileSync(seedDataPath, fileContent, 'utf8');
  console.log(`Successfully rewrote seedData.js at ${seedDataPath}`);
  
  // 2. Re-seed local PostgreSQL database if connection is available
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('\n[!] DATABASE_URL not found in .env. Skipping database re-seeding.');
    return;
  }
  
  console.log('\nConnecting to PostgreSQL database to empty and re-seed cards...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    try {
      console.log('  Emptying cards table (TRUNCATE TABLE cards CASCADE)...');
      await client.query('TRUNCATE TABLE cards CASCADE');
      
      console.log('  Inserting new card seeds...');
      for (const card of allCardsToSeed) {
        await client.query(`
          INSERT INTO cards (name, rarity, booster_pack, image_url, card_type, level, attribute, attack, defense, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          card.name,
          card.rarity,
          card.booster_pack,
          card.image_url,
          card.card_type,
          card.level,
          card.attribute,
          card.attack,
          card.defense,
          card.description
        ]);
      }
      console.log('  Database re-seeded successfully!');
    } finally {
      client.release();
    }
  } catch (dbErr) {
    console.error('Failed to update database cards directly:', dbErr.message);
  } finally {
    await pool.end();
  }
}

start().catch(console.error);
