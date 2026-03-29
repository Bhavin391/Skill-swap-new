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

  // Routes - Import from separate files (after DB is connected)
  const authRoutes = require('./routes/auth')(usersCollection);
  const userRoutes = require('./routes/users')(usersCollection);
  const matchRoutes = require('./routes/matches')(usersCollection);
  const chatRoutes = require('./routes/chat')(chatsCollection, messagesCollection, usersCollection);

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/messages', require('./routes/messages')(messagesCollection, chatsCollection));

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
