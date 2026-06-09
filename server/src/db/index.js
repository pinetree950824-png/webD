const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const seedCards = require('./seedData');

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('[DuelVerse DB] DATABASE_URL environment variable is missing!');
  }

  pool = new Pool({
    connectionString,
    ssl: {
      // Required for secure connection to hosted databases like Supabase or Neon
      rejectUnauthorized: false
    }
  });

  return pool;
}

function convertPlaceholders(sql, params) {
  let paramIndex = 1;
  // Replace SQLite "?" style parameters with PostgreSQL "$1", "$2", etc.
  const formattedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { formattedSql, formattedParams: params };
}

async function getDB() {
  const p = getPool();
  return {
    all: async (sql, params = []) => {
      const { formattedSql, formattedParams } = convertPlaceholders(sql, params);
      const res = await p.query(formattedSql, formattedParams);
      return res.rows;
    },
    get: async (sql, params = []) => {
      const { formattedSql, formattedParams } = convertPlaceholders(sql, params);
      const res = await p.query(formattedSql, formattedParams);
      return res.rows[0];
    },
    run: async (sql, params = []) => {
      const { formattedSql, formattedParams } = convertPlaceholders(sql, params);
      let finalSql = formattedSql;
      
      // Auto-append RETURNING id for insert statements to simulate SQLite's lastID
      if (/^\s*insert\s+/i.test(formattedSql) && !/returning\s+/i.test(formattedSql)) {
        finalSql += ' RETURNING id';
      }
      
      const res = await p.query(finalSql, formattedParams);
      return {
        lastID: res.rows && res.rows[0] ? res.rows[0].id : null,
        changes: res.rowCount
      };
    },
    exec: async (sql) => {
      await p.query(sql);
    }
  };
}

async function getTransactionDB() {
  const p = getPool();
  const client = await p.connect();
  
  return {
    client,
    db: {
      all: async (sql, params = []) => {
        const { formattedSql, formattedParams } = convertPlaceholders(sql, params);
        const res = await client.query(formattedSql, formattedParams);
        return res.rows;
      },
      get: async (sql, params = []) => {
        const { formattedSql, formattedParams } = convertPlaceholders(sql, params);
        const res = await client.query(formattedSql, formattedParams);
        return res.rows[0];
      },
      run: async (sql, params = []) => {
        const { formattedSql, formattedParams } = convertPlaceholders(sql, params);
        let finalSql = formattedSql;
        if (/^\s*insert\s+/i.test(formattedSql) && !/returning\s+/i.test(formattedSql)) {
          finalSql += ' RETURNING id';
        }
        const res = await client.query(finalSql, formattedParams);
        return {
          lastID: res.rows && res.rows[0] ? res.rows[0].id : null,
          changes: res.rowCount
        };
      }
    },
    release: () => client.release()
  };
}

async function initDB() {
  const database = await getDB();
  
  // Check if cards table exists in PostgreSQL public schema
  const tableCheck = await database.get(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'cards';
  `);
  
  if (!tableCheck) {
    console.log("PostgreSQL Database empty. Creating tables...");
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await database.exec(schemaSql);
    console.log("Database tables created successfully.");
  }

  // Check if cards table is seeded
  const cardCount = await database.get("SELECT COUNT(*) as count FROM cards;");
  const countNum = cardCount ? Number(cardCount.count) : 0;
  
  if (countNum === 0) {
    console.log("Seeding card database into PostgreSQL...");
    for (const card of seedCards) {
      await database.run(`
        INSERT INTO cards (name, rarity, booster_pack, image_url, card_type, level, attribute, attack, defense, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
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
      ]);
    }
    console.log(`Seeded ${seedCards.length} cards successfully.`);
  } else {
    console.log("Card database already seeded.");
  }
}

module.exports = {
  getDB,
  getTransactionDB,
  initDB
};
