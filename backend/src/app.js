require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');

// ── Startup validation ────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using an insecure fallback – set JWT_SECRET in production .env immediately!');
  process.env.JWT_SECRET = '__INSECURE_FALLBACK__PLEASE_SET_JWT_SECRET__';
}

const authRoutes    = require('./routes/auth');
const toiletRoutes  = require('./routes/toilets');
const reviewRoutes  = require('./routes/reviews');

const app = express();

// ── Security ─────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Static uploads ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/toilets', toiletRoutes);
app.use('/api/reviews', reviewRoutes);

// ── Health ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// ── Global error handler ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start HTTP server
// On Vercel: VERCEL=1 so we skip listen (serverless handles it)
// On Atom Hosting (Passenger) and local: always listen
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => console.log(`🚽  API ready → http://0.0.0.0:${PORT}`));
}

module.exports = app;
