require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const logger = require('./src/config/logger');

// Handle uncaught exceptions before any server code runs
process.on('uncaughtException', (err) => {
  logger.error('[CRITICAL] Uncaught Exception. Shutting down server...', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.io server
initSocket(server);

// Start server
const activeServer = server.listen(PORT, () => {
  logger.info(`[HomeHero Server] Running on http://localhost:${PORT}`);
  logger.info(`[HomeHero Server] Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('[CRITICAL] Unhandled Rejection. Shutting down server gracefully...', err);
  activeServer.close(() => {
    process.exit(1);
  });
});
