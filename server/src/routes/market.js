const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /listings - Get all active listings
router.get('/listings', async (req, res) => {
  const db = await getDB();
  try {
    const listings = await db.all(`
      SELECT 
        m.id as id,
        m.price as price,
        m.listed_at as listed_at,
        m.user_card_id as user_card_id,
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
        u.nickname as seller_nickname,
        u.id as seller_id
      FROM marketplace m
      JOIN user_cards uc ON m.user_card_id = uc.id
      JOIN cards c ON uc.card_id = c.id
      JOIN users u ON m.seller_id = u.id
      WHERE m.is_active = 1
      ORDER BY m.listed_at DESC
    `);
    res.json(listings);
  } catch (error) {
    console.error('Fetch listings error:', error);
    res.status(500).json({ error: '거래소 상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

// POST /sell - List a card for sale
router.post('/sell', authenticateToken, async (req, res) => {
  const { userCardId, price } = req.body;
  const sellerId = req.user.id;

  if (!userCardId || !price || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: '올바른 카드 ID와 가격을 입력해 주세요.' });
  }

  const db = await getDB();

  try {
    // 1. Verify ownership of the card
    const card = await db.get('SELECT user_id FROM user_cards WHERE id = ?', [userCardId]);
    if (!card) {
      return res.status(404).json({ error: '해당 인벤토리 카드를 찾을 수 없습니다.' });
    }

    if (card.user_id !== sellerId) {
      return res.status(403).json({ error: '자신이 소유한 카드만 판매할 수 있습니다.' });
    }

    // 2. Check if already listed
    const existingListing = await db.get(
      'SELECT id FROM marketplace WHERE user_card_id = ? AND is_active = 1',
      [userCardId]
    );
    if (existingListing) {
      return res.status(400).json({ error: '이미 거래소에 등록된 카드입니다.' });
    }

    // 3. Create listing
    await db.run(
      'INSERT INTO marketplace (user_card_id, seller_id, price) VALUES (?, ?, ?)',
      [userCardId, sellerId, parseInt(price)]
    );

    res.json({ success: true, message: '거래소에 카드가 성공적으로 등록되었습니다.' });

  } catch (error) {
    console.error('List card error:', error);
    res.status(500).json({ error: '카드 판매 등록 중 오류가 발생했습니다.' });
  }
});

// POST /cancel - Cancel a listing
router.post('/cancel', authenticateToken, async (req, res) => {
  const { listingId } = req.body;
  const userId = req.user.id;

  if (!listingId) {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  const db = await getDB();

  try {
    const listing = await db.get('SELECT seller_id, is_active FROM marketplace WHERE id = ?', [listingId]);
    if (!listing) {
      return res.status(404).json({ error: '등록된 상품을 찾을 수 없습니다.' });
    }

    if (listing.is_active === 0) {
      return res.status(400).json({ error: '이미 거래가 종료되거나 취소된 카드입니다.' });
    }

    if (listing.seller_id !== userId) {
      return res.status(403).json({ error: '판매자만 등록을 취소할 수 있습니다.' });
    }

    // Cancel listing (mark inactive)
    await db.run('UPDATE marketplace SET is_active = 0 WHERE id = ?', [listingId]);

    res.json({ success: true, message: '판매 등록이 취소되었습니다.' });

  } catch (error) {
    console.error('Cancel listing error:', error);
    res.status(500).json({ error: '판매 취소 처리 중 오류가 발생했습니다.' });
  }
});

// POST /buy - Buy a card
router.post('/buy', authenticateToken, async (req, res) => {
  const { listingId } = req.body;
  const buyerId = req.user.id;

  if (!listingId) {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  const db = await getDB();

  try {
    // 1. Start SQLite Transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Get active listing using SELECT ... FOR UPDATE (in SQLite we do standard select within tx)
      const listing = await db.get(
        'SELECT * FROM marketplace WHERE id = ? AND is_active = 1',
        [listingId]
      );

      if (!listing) {
        await db.run('ROLLBACK');
        return res.status(404).json({ error: '판매 중인 상품이 아니거나 이미 판매된 카드입니다.' });
      }

      if (listing.seller_id === buyerId) {
        await db.run('ROLLBACK');
        return res.status(400).json({ error: '자신이 등록한 카드는 구매할 수 없습니다.' });
      }

      // Check buyer's gold
      const buyer = await db.get('SELECT gold FROM users WHERE id = ?', [buyerId]);
      if (!buyer) {
        await db.run('ROLLBACK');
        return res.status(404).json({ error: '구매자 정보를 찾을 수 없습니다.' });
      }

      if (buyer.gold < listing.price) {
        await db.run('ROLLBACK');
        return res.status(400).json({ error: '골드가 부족합니다.' });
      }

      // 2. Perform Transaction actions
      // A. Deduct gold from buyer
      await db.run('UPDATE users SET gold = gold - ? WHERE id = ?', [listing.price, buyerId]);

      // B. Add gold to seller
      await db.run('UPDATE users SET gold = gold + ? WHERE id = ?', [listing.price, listing.seller_id]);

      // C. Transfer card ownership in inventory
      await db.run('UPDATE user_cards SET user_id = ? WHERE id = ?', [buyerId, listing.user_card_id]);

      // D. Mark listing as inactive (completed)
      await db.run('UPDATE marketplace SET is_active = 0 WHERE id = ?', [listingId]);

      await db.run('COMMIT');

      // Fetch buyer's updated gold to return
      const updatedBuyer = await db.get('SELECT gold FROM users WHERE id = ?', [buyerId]);

      res.json({
        success: true,
        message: '카드를 성공적으로 구매했습니다.',
        updatedGold: updatedBuyer.gold
      });

    } catch (txError) {
      await db.run('ROLLBACK');
      console.error('Buy transaction failed, rolled back:', txError);
      res.status(500).json({ error: '카드 구매 거래 처리 중 오류가 발생했습니다.' });
    }

  } catch (error) {
    console.error('Buy card API error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
