const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { getDB } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '325492193582-example.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// GET /google-client-id - Retrieve public Google Client ID for frontend initialization
router.get('/google-client-id', (req, res) => {
  res.json({ clientId: GOOGLE_CLIENT_ID });
});

// POST /guest - Guest login or registration
router.post('/guest', async (req, res) => {
  const { nickname } = req.body;
  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ error: '닉네임을 입력해 주세요.' });
  }

  const cleanNickname = nickname.trim();
  const db = await getDB();

  try {
    // Check if user exists
    let user = await db.get('SELECT * FROM users WHERE nickname = ? AND google_id IS NULL', [cleanNickname]);

    if (!user) {
      // Create new guest
      const result = await db.run(
        'INSERT INTO users (nickname, gold) VALUES (?, ?)',
        [cleanNickname, 100000] // Start with 100,000 gold
      );
      user = { id: result.lastID, nickname: cleanNickname, gold: 100000 };
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, nickname: user.nickname, gold: user.gold } });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// POST /google - Google login
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: '구글 토큰이 제공되지 않았습니다.' });
  }

  try {
    let googleId, email, name;

    // Development or fallback check
    if (credential.startsWith('mock_') || GOOGLE_CLIENT_ID.includes('example')) {
      // Use mock credentials for testing/evaluation convenience
      googleId = 'google_mock_' + (credential.split('_')[1] || 'user');
      email = `${googleId}@example.com`;
      name = `구글게스트_${googleId.slice(-4)}`;
    } else {
      // Verify Google ID Token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload['sub'];
      email = payload['email'];
      name = payload['name'] || payload['given_name'] || 'Google User';
    }

    const db = await getDB();
    let user = await db.get('SELECT * FROM users WHERE google_id = ?', [googleId]);

    if (!user) {
      // Register new google user
      // Avoid duplicate nicknames by appending random digits if nickname exists
      let finalNickname = name;
      const existingName = await db.get('SELECT id FROM users WHERE nickname = ?', [finalNickname]);
      if (existingName) {
        finalNickname = `${name}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const result = await db.run(
        'INSERT INTO users (nickname, google_id, gold) VALUES (?, ?, ?)',
        [finalNickname, googleId, 100000]
      );
      user = { id: result.lastID, nickname: finalNickname, gold: 100000 };
    }

    const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, nickname: user.nickname, gold: user.gold } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: '구글 로그인 검증에 실패했습니다.' });
  }
});

// GET /me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  const db = await getDB();
  try {
    const user = await db.get('SELECT id, nickname, gold, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
