/**
 * Database Connection & Resilient Store Manager
 * Connects to MongoDB via Mongoose. If MongoDB is unavailable (or sandboxed without network),
 * transparently switches to an in-memory document store so the application runs without interruption.
 */

const mongoose = require('mongoose');

let isConnected = false;
let isFallbackMode = false;

// In-Memory store fallback
const memoryStore = {
  users: [],
  events: [],
  alerts: []
};

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/automata_nids';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    isFallbackMode = false;
    console.log(`✅ [MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    console.warn(`⚠️ [MongoDB] Connection failed (${err.message}).`);
    console.warn(`⚡ [Fallback] Activating in-memory persistence layer. Full API & Automata engine operational.`);
    isConnected = false;
    isFallbackMode = true;
  }
}

function getStoreStatus() {
  return {
    isConnected,
    isFallbackMode,
    type: isFallbackMode ? 'In-Memory DB Store' : 'MongoDB (Live)',
    counts: {
      users: isFallbackMode ? memoryStore.users.length : null,
      events: isFallbackMode ? memoryStore.events.length : null,
      alerts: isFallbackMode ? memoryStore.alerts.length : null
    }
  };
}

module.exports = {
  connectDB,
  getStoreStatus,
  memoryStore,
  isUsingFallback: () => isFallbackMode
};
