require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.io server
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`[HomeHero Server] Running on http://localhost:${PORT}`);
  console.log(`[HomeHero Server] Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Server Error] Unhandled Rejection:', err.message);
  // Close server & exit process if critical, or log
});
