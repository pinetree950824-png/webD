-- Enable Foreign Key Support
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT UNIQUE NOT NULL,
    google_id TEXT UNIQUE DEFAULT NULL,
    gold INTEGER NOT NULL DEFAULT 10000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cards Table
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,          -- Common, Rare, Super Rare, Ultra Rare, Prismatic Secret Rare, Overframe Rare
    booster_pack TEXT NOT NULL,    -- Chaos Origins, Limit Over Collection -THE HEROES-, Limit Over Collection -THE RIVALS-
    image_url TEXT NOT NULL,
    card_type TEXT DEFAULT 'Monster', -- Monster, Spell, Trap
    level INTEGER DEFAULT NULL,
    attribute TEXT DEFAULT NULL,
    attack INTEGER DEFAULT NULL,
    defense INTEGER DEFAULT NULL,
    description TEXT DEFAULT ''
);

-- User Card Inventory Table
CREATE TABLE IF NOT EXISTS user_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    card_id INTEGER NOT NULL,
    acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_card_id INTEGER NOT NULL UNIQUE,
    seller_id INTEGER NOT NULL,
    price INTEGER NOT NULL CHECK(price > 0),
    listed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER NOT NULL DEFAULT 1, -- 1 = active, 0 = sold/canceled
    FOREIGN KEY(user_card_id) REFERENCES user_cards(id) ON DELETE CASCADE,
    FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_cards_user ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_pack ON cards(booster_pack);
CREATE INDEX IF NOT EXISTS idx_market_active ON marketplace(is_active);
CREATE INDEX IF NOT EXISTS idx_market_seller ON marketplace(seller_id);
