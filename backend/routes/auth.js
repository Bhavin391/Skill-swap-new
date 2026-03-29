const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = (usersCollection) => {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Signup
  router.post('/signup', async (req, res) => {
    try {
      console.log('[v0] Signup request received:', { name: req.body.name, email: req.body.email });
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        console.log('[v0] Signup validation failed - missing fields');
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if user exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        console.log('[v0] User already exists:', email);
        return res.status(400).json({ message: 'User already exists' });
      }

      console.log('[v0] Hashing password...');
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('[v0] Creating user in database...');
      // Create user
      const result = await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        skills_offering: [],
        skills_learning: [],
        created_at: new Date(),
      });

      const userId = result.insertedId.toString();
      console.log('[v0] User created with ID:', userId);

      // Generate token
      const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('[v0] Signup successful for:', email);
      res.json({
        message: 'User created successfully',
        token,
        user: {
          _id: userId,
          name,
          email,
        },
      });
    } catch (error) {
      console.error('[v0] Signup error:', error.message, error);
      res.status(500).json({ message: 'Signup failed: ' + error.message });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
      }

      // Find user
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const userId = user._id.toString();

      // Generate token
      const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          _id: userId,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('[v0] Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  return router;
};
