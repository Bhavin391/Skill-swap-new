const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = (chatsCollection, messagesCollection, usersCollection) => {
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

  // Get all chats for current user
  router.get('/', verifyToken, async (req, res) => {
    try {
      const userId = new ObjectId(req.userId);
      
      const chats = await chatsCollection.find({
        $or: [{ user1_id: userId }, { user2_id: userId }],
      }).toArray();

      // Get chat details with last messages
      const chatDetails = await Promise.all(
        chats.map(async chat => {
          const otherUserId =
            chat.user1_id.toString() === req.userId
              ? chat.user2_id
              : chat.user1_id;

          const otherUser = await usersCollection.findOne({ _id: otherUserId });
          const lastMessage = await messagesCollection.findOne(
            { chat_id: chat._id },
            { sort: { timestamp: -1 } }
          );

          // Count unread messages from the other user
          const unreadCount = await messagesCollection.countDocuments({
            chat_id: chat._id,
            sender_id: otherUserId,
            seen: false,
          });

          return {
            _id: chat._id.toString(),
            user_id: otherUserId.toString(),
            name: otherUser?.name || 'Unknown',
            email: otherUser?.email || '',
            last_message: lastMessage?.text || '',
            last_message_time: lastMessage?.timestamp || null,
            unread_count: unreadCount,
          };
        })
      );

      res.json({ chats: chatDetails });
    } catch (error) {
      console.error('[v0] Error fetching chats:', error);
      res.status(500).json({ message: 'Error fetching chats' });
    }
  });

  // Get specific chat with messages
  router.get('/:chatId', verifyToken, async (req, res) => {
    try {
      const chat = await chatsCollection.findOne({ _id: new ObjectId(req.params.chatId) });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Verify user is part of this chat
      if (
        chat.user1_id.toString() !== req.userId &&
        chat.user2_id.toString() !== req.userId
      ) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Get other user info
      const otherUserId =
        chat.user1_id.toString() === req.userId
          ? chat.user2_id
          : chat.user1_id;

      const otherUser = await usersCollection.findOne({ _id: otherUserId });

      // Get messages
      const messages = await messagesCollection
        .find({ chat_id: chat._id })
        .sort({ timestamp: 1 })
        .toArray();

      res.json({
        chat: { ...chat, _id: chat._id.toString() },
        other_user: { ...otherUser, _id: otherUser._id.toString() },
        messages: messages.map(m => ({ ...m, _id: m._id.toString(), chat_id: m.chat_id.toString(), sender_id: m.sender_id.toString() })),
        current_user_id: req.userId,
      });
    } catch (error) {
      console.error('[v0] Error fetching chat:', error);
      res.status(500).json({ message: 'Error fetching chat' });
    }
  });

  // Create or get chat with another user
  router.post('/init/:userId', verifyToken, async (req, res) => {
    try {
      const user1Id = new ObjectId(req.userId);
      const user2Id = new ObjectId(req.params.userId);

      // Check if chat already exists
      let chat = await chatsCollection.findOne({
        $or: [
          { user1_id: user1Id, user2_id: user2Id },
          { user1_id: user2Id, user2_id: user1Id },
        ],
      });

      if (!chat) {
        const result = await chatsCollection.insertOne({
          user1_id: user1Id,
          user2_id: user2Id,
          created_at: new Date(),
        });
        chat = { _id: result.insertedId };
      }

      res.json({ chat_id: chat._id.toString() });
    } catch (error) {
      console.error('[v0] Error initializing chat:', error);
      res.status(500).json({ message: 'Error initializing chat' });
    }
  });

  return router;
};
