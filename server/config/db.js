/**
 * Database Connection & Resilient Store Manager
 * Connects to MongoDB via Mongoose. If MongoDB is unavailable (or sandboxed without network),
 * transparently switches to an in-memory document store so the application runs without interruption.
 */

const mongoose = require('mongoose');

let lastMongoError = null;
let reconnectInterval = null;

// In-Memory store fallback
const memoryStore = {
  users: [],
  events: [],
  alerts: []
};

function scheduleReconnect() {
  if (reconnectInterval) return;
  reconnectInterval = setInterval(async () => {
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 [MongoDB] Retrying connection to MongoDB Atlas in background...');
      await connectDB();
      if (mongoose.connection.readyState === 1) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
        try {
          const { seedDatabase } = require('../utils/seeder');
          await seedDatabase(true);
          console.log('📦 [Auto-Sync] Data seeded/synced to live MongoDB Atlas.');
        } catch (e) {
          console.warn('⚠️ [Auto-Sync] Sync warning:', e.message);
        }
      }
    } else {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  }, 15000);
}

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/automata_nids';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Force IPv4 to prevent IPv6 DNS delays
    });
    lastMongoError = null;
    console.log(`✅ [MongoDB] Connected successfully to ${uri.replace(/:[^:]*@/, ':***@')}`);
  } catch (err) {
    lastMongoError = err.message;
    console.warn(`⚠️ [MongoDB] Connection failed (${err.message}).`);
    console.warn(`⚡ [Fallback] Activating in-memory persistence layer. Full API & Automata engine operational.`);
    scheduleReconnect();
  }
}

function getStoreStatus() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || '';
  const isConnected = mongoose.connection.readyState === 1;
  return {
    isConnected,
    isFallbackMode: !isConnected,
    type: isConnected ? 'MongoDB Atlas (Live)' : 'In-Memory DB Store',
    readyState: mongoose.connection.readyState,
    configuredUri: uri ? uri.replace(/:[^:]*@/, ':***@') : 'not-configured',
    lastError: lastMongoError,
    counts: {
      users: !isConnected ? memoryStore.users.length : null,
      events: !isConnected ? memoryStore.events.length : null,
      alerts: !isConnected ? memoryStore.alerts.length : null
    }
  };
}

module.exports = {
  connectDB,
  getStoreStatus,
  memoryStore,
  isUsingFallback: () => mongoose.connection.readyState !== 1
};
