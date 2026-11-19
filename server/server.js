/**
 * Automata-Based Network Intrusion Detection System
 * Main Express Backend Application Server (Production & Render Deployment Ready)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { connectDB, getStoreStatus } = require('./config/db');
const { seedDatabase } = require('./utils/seeder');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// 2. HTTP Response Compression (Gzip / Deflate)
app.use(compression());

// 3. CORS Configuration for Local & Render / Vercel Deployments
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow configured origins, Vercel preview/production domains, and Render services
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow to avoid unexpected CORS blocks
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 4. Request Body Parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 5. Production Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// 6. Required Health Check Endpoint for Render & Monitors (GET /health)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// System Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'Automata-Based Network Intrusion Detection System',
    timestamp: new Date().toISOString(),
    database: getStoreStatus()
  });
});

// Database Reconnect Trigger Endpoint
app.post('/api/db/reconnect', async (req, res) => {
  try {
    await connectDB();
    const status = getStoreStatus();
    if (status.isConnected) {
      try {
        const { seedDatabase } = require('./utils/seeder');
        await seedDatabase(true);
      } catch (seedErr) {}
    }
    return res.status(200).json({ success: true, database: status });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, database: getStoreStatus() });
  }
});

// 7. Mount Application API Routes (Both /api/* and root for REST compliance)
app.use('/api', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', alertRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', reportRoutes);

app.use('/', authRoutes);
app.use('/', eventRoutes);
app.use('/', alertRoutes);
app.use('/', dashboardRoutes);
app.use('/', reportRoutes);

// 8. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// 9. Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Startup sequence
async function startServer() {
  try {
    await connectDB();

    // Auto seed sample data on first run
    try {
      await seedDatabase(true);
      console.log('📦 [Auto-Seed] Initial network events and automata alerts populated.');
    } catch (seedErr) {
      console.warn('⚠️ [Auto-Seed] Warning during initial seed:', seedErr.message);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n========================================================`);
      console.log(`🛡️  AUTOMATA NIDS BACKEND SERVER ONLINE (PROD READY)`);
      console.log(`📡  Listening on port: ${PORT} (0.0.0.0:${PORT})`);
      console.log(`🔍  Automata Engine: 4 Intrusion Rules Active`);
      console.log(`❤️  Health Check: GET /health`);
      console.log(`📋  REST Endpoints: /login, /register, /upload, /events, /alerts, /dashboard`);
      console.log(`========================================================\n`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
