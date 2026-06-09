const express = require('express');
const router = express.Router();
const { getDB, getTransactionDB } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Available booster packs metadata
const BOOSTER_PACKS = [
  {
    id: "chaos_origins",
    name: "Chaos Origins",
    kr_name: "카오스 오리진즈",
    description: "카오스 솔저와 종언의 드래곤 등 강력한 광암 카오스 테마 수록!",
    cost_single: 100,
    cost_ten: 1000,
    cover_image: "https://images.ygoprodeck.com/images/cards/72869073.jpg" // Chaos Soldier image as cover
  },
  {
    id: "limit_heroes",
    name: "Limit Over Collection -THE HEROES-",
    kr_name: "리미트 오버 컬렉션 -더 히어로즈-",
    description: "역대 주인공들의 에이스 카드와 초고화질 오버프레임 레어 수록!",
    cost_single: 100,
    cost_ten: 1000,
    cover_image: "https://images.ygoprodeck.com/images/cards/28754358.jpg" // Neos image as cover
  },
  {
    id: "limit_rivals",
    name: "Limit Over Collection -THE RIVALS-",
    kr_name: "리미트 오버 컬렉션 -더 라이벌즈-",
    description: "푸른 눈의 백룡과 레드 데몬즈 등 숙명의 라이벌 카드 및 오버프레임 수록!",
    cost_single: 100,
    cost_ten: 1000,
    cover_image: "https://images.ygoprodeck.com/images/cards/89631139.jpg" // Blue-Eyes image as cover
  }
];

// GET /packs - Get list of booster packs
router.get('/packs', (req, res) => {
  res.json(BOOSTER_PACKS);
});

// POST /draw - Draw cards from a pack
router.post('/draw', authenticateToken, async (req, res) => {
  const { packName, amount } = req.body;
  const userId = req.user.id;

  if (!packName || ![1, 10].includes(amount)) {
    return res.status(400).json({ error: '잘못된 요청 파라미터입니다.' });
  }

  // Find pack
  const pack = BOOSTER_PACKS.find(p => p.name === packName || p.kr_name === packName);
  if (!pack) {
    return res.status(400).json({ error: '존재하지 않는 부스터 팩입니다.' });
  }

  const cost = amount === 1 ? pack.cost_single : pack.cost_ten;
  const db = await getDB();

  try {
    // 1. Check user gold
    const user = await db.get('SELECT gold FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    if (user.gold < cost) {
      return res.status(400).json({ error: '골드가 부족합니다.' });
    }

    // 2. Fetch all cards in this pack
    const packCards = await db.all('SELECT * FROM cards WHERE booster_pack = ?', [pack.name]);
    if (packCards.length === 0) {
      return res.status(500).json({ error: '해당 팩에 수록된 카드가 없습니다.' });
    }

    // 3. Setup draw probabilities
    // Weight-based rolling:
    // Overframe Rare: 2%
    // Prismatic Secret Rare: 3%
    // Ultra Rare: 10%
    // Super Rare: 20%
    // Rare: 30%
    // Common: 35%
    const rarityWeights = {
      "Overframe Rare": 2,
      "Prismatic Secret Rare": 3,
      "Ultra Rare": 10,
      "Super Rare": 20,
      "Rare": 30,
      "Common": 35
    };

    const getRarityCategory = (rarity) => {
      const r = (rarity || '').toLowerCase().trim();
      if (r.includes('quarter century') || r.includes('holographic') || r.includes('ghost') || r.includes('overframe')) {
        return 'Overframe Rare';
      }
      if (r.includes('secret') || r.includes('prismatic') || r.includes('ultimate') || r.includes('collector')) {
        return 'Prismatic Secret Rare';
      }
      if (r.includes('ultra')) {
        return 'Ultra Rare';
      }
      if (r.includes('super')) {
        return 'Super Rare';
      }
      if (r === 'rare') {
        return 'Rare';
      }
      return 'Common';
    };

    const rollRarity = () => {
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const [rarity, weight] of Object.entries(rarityWeights)) {
        cumulative += weight;
        if (rand <= cumulative) {
          return rarity;
        }
      }
      return "Common";
    };

    // Helper to get card of a specific rarity or fallback
    const drawSingleCard = (cards) => {
      const rolledRarity = rollRarity();
      let candidates = cards.filter(c => getRarityCategory(c.rarity) === rolledRarity);
      
      // Fallback if no cards of rolled rarity exist in this pack
      if (candidates.length === 0) {
        candidates = cards; // Grab anything from the pack
      }

      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex];
    };

    const drawnCards = [];
    for (let i = 0; i < amount; i++) {
      drawnCards.push(drawSingleCard(packCards));
    }

    // 4. Save to Database using a Transaction
    const tx = await getTransactionDB();
    const txDb = tx.db;

    try {
      await tx.client.query('BEGIN');

      // Deduct gold
      await txDb.run('UPDATE users SET gold = gold - ? WHERE id = ?', [cost, userId]);

      // Insert drawn cards into user's inventory
      for (const card of drawnCards) {
        await txDb.run('INSERT INTO user_cards (user_id, card_id) VALUES (?, ?)', [userId, card.id]);
      }

      await tx.client.query('COMMIT');

      // Get updated gold
      const updatedUser = await txDb.get('SELECT gold FROM users WHERE id = ?', [userId]);

      res.json({
        drawnCards,
        updatedGold: updatedUser.gold
      });

    } catch (txError) {
      await tx.client.query('ROLLBACK');
      console.error('Transaction failed, rolled back:', txError);
      res.status(500).json({ error: '카드 획득 처리 중 오류가 발생했습니다.' });
    } finally {
      tx.release();
    }

  } catch (error) {
    console.error('Gacha draw error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
