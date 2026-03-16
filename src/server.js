const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const server = app.listen(config.app.port, () => {
  logger.info(`🚀 ${config.app.name} started`);
  logger.info(`   Environment: ${config.app.env}`);
  logger.info(`   Port: ${config.app.port}`);
  logger.info(`   Health: http://localhost:${config.app.port}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('Server closed. Process terminating.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
