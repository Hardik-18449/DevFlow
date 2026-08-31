const mongoose = require('mongoose');
const env = require('./env');

let mongoMemoryInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || env.MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Database connection (${mongoUri}) failed: ${err.message}`);
    
    // Only attempt MongoMemoryServer in local development environments
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      console.log(`[MongoDB] Initializing in-memory MongoMemoryServer fallback...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryInstance = await MongoMemoryServer.create();
        const uri = mongoMemoryInstance.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[MongoDB] Connected to in-memory database at ${uri}`);
        return conn;
      } catch (memErr) {
        console.error('[MongoDB] In-memory database initialization failed:', memErr.message);
      }
    }
    throw err;
  }
};

module.exports = connectDB;
