const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = (usersCollection) => {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Middleware to verify token
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('[v0] Auth header:', authHeader ? 'present' : 'missing');
    
    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.log('[v0] No token found in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      console.log('[v0] Verifying token...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('[v0] Token decoded, userId:', decoded.userId);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('[v0] Token verification error:', error.message);
      res.status(401).json({ message: 'Invalid token: ' + error.message });
    }
  };

  // Get current user
  router.get('/me', verifyToken, async (req, res) => {
    try {
      console.log('[v0] Fetching user with ID:', req.userId);
      const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
      if (!user) {
        console.log('[v0] User not found for ID:', req.userId);
        return res.status(404).json({ message: 'User not found' });
      }
      console.log('[v0] User found:', user.email);
      const { password, ...userWithoutPassword } = user;
      res.json({ user: { ...userWithoutPassword, _id: user._id.toString() } });
    } catch (error) {
      console.error('[v0] Error fetching user:', error.message);
      res.status(500).json({ message: 'Error fetching user: ' + error.message });
    }
  });

  // Update user skills
  router.put('/me/skills', verifyToken, async (req, res) => {
    try {
      const { skills_offering, skills_learning } = req.body;

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(req.userId) },
        {
          $set: {
            skills_offering: skills_offering || [],
            skills_learning: skills_learning || [],
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = result;
      res.json({ message: 'Skills updated', user: { ...userWithoutPassword, _id: result._id.toString() } });
    } catch (error) {
      console.error('[v0] Error updating skills:', error);
      res.status(500).json({ message: 'Error updating skills' });
    }
  });

  // Get user by ID
  router.get('/:id', async (req, res) => {
    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ user: { ...userWithoutPassword, _id: user._id.toString() } });
    } catch (error) {
      console.error('[v0] Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  });

  // Verify a skill
  router.put('/me/skills/verify', verifyToken, async (req, res) => {
    try {
      const { skill } = req.body;
      if (!skill) return res.status(400).json({ message: 'Missing skill' });

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(req.userId) },
        {
          $addToSet: {
            verified_skills: skill
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = result;
      res.json({ message: 'Skill verified successfully', user: { ...userWithoutPassword, _id: result._id.toString() } });
    } catch (error) {
      console.error('[v0] Error verifying skill:', error);
      res.status(500).json({ message: 'Error verifying skill' });
    }
  });

  return router;
};
