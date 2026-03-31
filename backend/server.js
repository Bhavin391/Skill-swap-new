require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[v0] ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'skillswap';

let db = null;
let usersCollection = null;
let chatsCollection = null;
let messagesCollection = null;

const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    usersCollection = db.collection('users');
    chatsCollection = db.collection('chats');
    messagesCollection = db.collection('messages');

    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await chatsCollection.createIndex({ user1_id: 1, user2_id: 1 });
    await messagesCollection.createIndex({ chat_id: 1 });
    await messagesCollection.createIndex({ timestamp: 1 });

    console.log('[v0] Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('[v0] MongoDB connection error:', err);
    process.exit(1);
  }
}

async function startServer() {
  await connectDB();

  // 1. Load routes
  const authRoutes = require('./routes/auth')(usersCollection);
  const userRoutes = require('./routes/users')(usersCollection);
  const matchRoutes = require('./routes/matches')(usersCollection);
  const chatRoutes = require('./routes/chat')(chatsCollection, messagesCollection, usersCollection);
  const msgRoutes = require('./routes/messages')(messagesCollection, chatsCollection);
  const aiRoutes = require('./routes/ai')();

  // 2. Debugging Check: Find the broken route
  console.log("--- ROUTER DIAGNOSTICS ---");
  console.log("Auth Router:", typeof authRoutes === 'function' ? "✅ OK" : "❌ FAILED (Got " + typeof authRoutes + ")");
  console.log("User Router:", typeof userRoutes === 'function' ? "✅ OK" : "❌ FAILED (Got " + typeof userRoutes + ")");
  console.log("Match Router:", typeof matchRoutes === 'function' ? "✅ OK" : "❌ FAILED (Got " + typeof matchRoutes + ")");
  console.log("Chat Router:", typeof chatRoutes === 'function' ? "✅ OK" : "❌ FAILED (Got " + typeof chatRoutes + ")");
  console.log("Msg Router:", typeof msgRoutes === 'function' ? "✅ OK" : "❌ FAILED (Got " + typeof msgRoutes + ")");
  console.log("AI Router:", typeof aiRoutes === 'function' ? "✅ OK" : "❌ FAILED (Got " + typeof aiRoutes + ")");
  console.log("--------------------------");

  // 3. Mount routes (only if they are valid, prevents server crash)
  if (typeof authRoutes === 'function') app.use('/api/auth', authRoutes);
  if (typeof userRoutes === 'function') app.use('/api/users', userRoutes);
  if (typeof matchRoutes === 'function') app.use('/api/matches', matchRoutes);
  if (typeof chatRoutes === 'function') app.use('/api/chats', chatRoutes);
  if (typeof msgRoutes === 'function') app.use('/api/messages', msgRoutes);
  if (typeof aiRoutes === 'function') app.use('/api/ai', aiRoutes);
  
  // Root route
  app.get('/', (req, res) => {
    res.json({ message: 'SkillSwap API - Backend running', status: 'OK' });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });

  // Explicit preflight handler for CORS
  app.options('*', cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 404 handler
  app.use((req, res) => {
    console.log('[v0] 404 Not Found:', req.method, req.path);
    res.status(404).json({ message: 'Route not found' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('[v0] Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[v0] SkillSwap backend running on http://localhost:${PORT}`);
    console.log(`[v0] Frontend should connect to http://localhost:${PORT}/api`);
  });
}

startServer();
