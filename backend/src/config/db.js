const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const isLocal = !process.env.MONGO_URI || 
    process.env.MONGO_URI.includes('localhost') || 
    process.env.MONGO_URI.includes('127.0.0.1');

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/stylesync';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);

    if (isLocal) {
      console.log('ℹ️ Attempting to start in-memory MongoDB fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ Connected to In-Memory MongoDB: ${conn.connection.host}`);
        
        console.log('🌱 Seeding in-memory database...');
        const seedData = require('../utils/seed');
        await seedData(false);
        return;
      } catch (memErr) {
        console.error(`💥 In-memory MongoDB failed to start: ${memErr.message}`);
      }
    }

    console.error('💀 Could not establish database connection. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
