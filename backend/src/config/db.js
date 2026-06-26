const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homehero');
    logger.info(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`[MongoDB] Database connection failed: ${error.message}`);
    logger.warn(`[MongoDB] WARNING: Server is starting in DEMO/OFFLINE mode. Database operations will be mocked or throw errors, but Express endpoints will remain active.`);
  }
};

module.exports = connectDB;
