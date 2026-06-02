const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const authRouter = require('./routes/auth');
const gachaRouter = require('./routes/gacha');
const albumRouter = require('./routes/album');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: '*', // Dynamic routing via Nginx in production, open for dev ease
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routers
app.use('/auth', authRouter);
app.use('/gacha', gachaRouter);
app.use('/album', albumRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Database Auto-Initialization & Bootstrap
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[DuelVerse Backend] Running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database on startup:', err);
    process.exit(1);
  });
