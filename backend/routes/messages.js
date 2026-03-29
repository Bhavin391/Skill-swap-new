const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = (messagesCollection, chatsCollection) => {
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

  // Send message
  router.post('/', verifyToken, async (req, res) => {
    try {
      const { chat_id, text } = req.body;

      if (!chat_id || !text) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify user is part of this chat
      const chat = await chatsCollection.findOne({ _id: new ObjectId(chat_id) });
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      if (
        chat.user1_id.toString() !== req.userId &&
        chat.user2_id.toString() !== req.userId
      ) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Create message
      const result = await messagesCollection.insertOne({
        chat_id: new ObjectId(chat_id),
        sender_id: new ObjectId(req.userId),
        text,
        timestamp: new Date(),
        seen: false,
        read_at: null,
      });

      console.log('[v0] Message sent in chat', chat_id);

      res.json({
        message: 'Message sent',
        data: {
          _id: result.insertedId.toString(),
          chat_id,
          sender_id: req.userId,
          text,
          timestamp: new Date(),
          seen: false,
          read_at: null,
        },
      });
    } catch (error) {
      console.error('[v0] Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  });

  // Get messages for a chat
  router.get('/chat/:chatId', verifyToken, async (req, res) => {
    try {
      const messages = await messagesCollection
        .find({ chat_id: new ObjectId(req.params.chatId) })
        .sort({ timestamp: 1 })
        .toArray();

      res.json({
        messages: messages.map(m => ({
          ...m,
          _id: m._id.toString(),
          chat_id: m.chat_id.toString(),
          sender_id: m.sender_id.toString(),
        })),
      });
    } catch (error) {
      console.error('[v0] Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });

  // Mark messages as read
  router.put('/read/:chatId', verifyToken, async (req, res) => {
    try {
      const chatId = new ObjectId(req.params.chatId);
      const userId = new ObjectId(req.userId);

      // Mark all messages from other users in this chat as read
      const result = await messagesCollection.updateMany(
        { chat_id: chatId, sender_id: { $ne: userId }, seen: false },
        { 
          $set: { 
            seen: true,
            read_at: new Date(),
          }
        }
      );

      console.log('[v0] Marked', result.modifiedCount, 'messages as read');

      res.json({ 
        message: 'Messages marked as read',
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error('[v0] Error marking messages as read:', error);
      res.status(500).json({ message: 'Error marking messages as read' });
    }
  });

  return router;
};
