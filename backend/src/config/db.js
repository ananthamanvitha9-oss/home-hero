const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homehero');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Database connection failed: ${error.message}`);
    console.warn(`[MongoDB] WARNING: Server is starting in DEMO/OFFLINE mode. Database operations will be mocked or throw errors, but Express endpoints will remain active.`);
  }
};

module.exports = connectDB;
