const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = (usersCollection) => {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Middleware to verify token
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('[v0] Token verification error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Calculate match score between two users
  const calculateMatchScore = (currentUser, potentialMatch) => {
    let score = 0;

    // Check how many skills current user wants to learn that the match offers
    const matchingOfferings = (currentUser.skills_learning || []).filter(skill =>
      (potentialMatch.skills_offering || []).some(
        s => s.toLowerCase() === skill.toLowerCase()
      )
    ).length;

    // Check how many skills current user offers that the match wants to learn
    const matchingLearning = (currentUser.skills_offering || []).filter(skill =>
      (potentialMatch.skills_learning || []).some(
        s => s.toLowerCase() === skill.toLowerCase()
      )
    ).length;

    // Calculate percentage
    const totalSkillsNeeded =
      (currentUser.skills_learning?.length || 0) + (currentUser.skills_offering?.length || 0);

    if (totalSkillsNeeded > 0) {
      score = ((matchingOfferings + matchingLearning) / totalSkillsNeeded) * 100;
    }

    return Math.round(score);
  };

  // Get matches for current user
  router.get('/', verifyToken, async (req, res) => {
    try {
      const currentUser = await usersCollection.findOne({ _id: new ObjectId(req.userId) });

      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get all other users
      const allUsers = await usersCollection
        .find({ _id: { $ne: new ObjectId(req.userId) } })
        .toArray();

      // Calculate match scores
      const matches = allUsers
        .map(user => ({
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          skills_offering: user.skills_offering || [],
          skills_learning: user.skills_learning || [],
          match_score: calculateMatchScore(currentUser, user),
        }))
        .filter(match => match.match_score > 0) // Only return matches with score > 0
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 20); // Limit to top 20 matches

      console.log(`[v0] Found ${matches.length} matches for user ${req.userId}`);

      res.json({ matches });
    } catch (error) {
      console.error('[v0] Error calculating matches:', error);
      res.status(500).json({ message: 'Error calculating matches' });
    }
  });

  return router;
};
