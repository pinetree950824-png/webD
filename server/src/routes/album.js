const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /cards - Get all cards in the game with user owned count
router.get('/cards', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const db = await getDB();

  try {
    const cards = await db.all(`
      SELECT 
        c.*,
        COUNT(uc.id) as owned_count
      FROM cards c
      LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = ?
      GROUP BY c.id
      ORDER BY c.id ASC
    `, [userId]);

    res.json(cards);
  } catch (error) {
    console.error('All cards fetch error:', error);
    res.status(500).json({ error: '카드 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// GET /inventory - Get user's card inventory
router.get('/inventory', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const db = await getDB();

  try {
    const inventory = await db.all(`
      SELECT 
        uc.id as user_card_id,
        c.id as card_id,
        c.name as name,
        c.rarity as rarity,
        c.booster_pack as booster_pack,
        c.image_url as image_url,
        c.card_type as card_type,
        c.level as level,
        c.attribute as attribute,
        c.attack as attack,
        c.defense as defense,
        c.description as description,
        uc.acquired_at as acquired_at
      FROM user_cards uc
      JOIN cards c ON uc.card_id = c.id
      WHERE uc.user_id = ?
      ORDER BY uc.acquired_at DESC
    `, [userId]);

    res.json(inventory);
  } catch (error) {
    console.error('Inventory fetch error:', error);
    res.status(500).json({ error: '인벤토리를 불러오는 중 오류가 발생했습니다.' });
  }
});

// GET /collection-stats - Get collection progress statistics
router.get('/collection-stats', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const db = await getDB();

  try {
    // Get all cards in database
    const allCards = await db.all('SELECT id, name, booster_pack, rarity FROM cards');
    
    // Get all unique card IDs collected by user
    const collectedRows = await db.all(
      'SELECT DISTINCT card_id FROM user_cards WHERE user_id = ?',
      [userId]
    );
    const collectedIds = new Set(collectedRows.map(r => r.card_id));

    // Calculate overall stats
    const totalCount = allCards.length;
    const collectedCount = collectedIds.size;
    const overallProgress = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

    // Calculate pack-specific stats
    const packsData = {};
    allCards.forEach(card => {
      if (!packsData[card.booster_pack]) {
        packsData[card.booster_pack] = { total: 0, collected: 0 };
      }
      packsData[card.booster_pack].total += 1;
      if (collectedIds.has(card.id)) {
        packsData[card.booster_pack].collected += 1;
      }
    });

    const packsProgress = Object.keys(packsData).map(packName => {
      const { total, collected } = packsData[packName];
      const progress = total > 0 ? Math.round((collected / total) * 100) : 0;
      return {
        packName,
        total,
        collected,
        progress
      };
    });

    res.json({
      totalCards: totalCount,
      collectedCards: collectedCount,
      overallProgress,
      packsProgress
    });

  } catch (error) {
    console.error('Collection stats error:', error);
    res.status(500).json({ error: '수집 통계를 계산하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
