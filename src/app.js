const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const healthRoutes = require('./routes/health');
const itemRoutes = require('./routes/items');

const app = express();

// ─── Security Middleware ───────────────────────────────────
app.use(helmet());
app.use(cors());

// ─── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Request Logging ───────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (req) => req.url === '/health',
  })
);

// ─── Routes ────────────────────────────────────────────────
app.use('/', healthRoutes);
app.use('/api/items', itemRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CI/CD Pipeline Demo API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      ready: 'GET /ready',
      items: 'GET /api/items',
    },
  });
});

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
  });
});

module.exports = app;
