const express = require('express');
const os = require('os');
const logger = require('../utils/logger');

const router = express.Router();

const startTime = Date.now();

// Health check endpoint - used by load balancers and monitoring
router.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Readiness check - are we ready to receive traffic?
router.get('/ready', (req, res) => {
  // Add real dependency checks here (DB, cache, etc.)
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

// System info endpoint (non-production only)
router.get('/info', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: {
      total: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
      free: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
    },
    nodeVersion: process.version,
  });
});

module.exports = router;
