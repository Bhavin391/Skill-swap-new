# SkillSwap Backend

Express.js API server for the SkillSwap application.

## Requirements

- Node.js 16+
- MongoDB 4.0+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me/skills` - Update user skills
- `GET /api/users/:id` - Get user by ID

### Matches
- `GET /api/matches` - Get skill matches for current user

### Chats
- `GET /api/chats` - Get all conversations for current user
- `GET /api/chats/:chatId` - Get specific chat with messages
- `POST /api/chats/init/:userId` - Create or get chat with another user

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/chat/:chatId` - Get messages for a chat

## Matching Algorithm

The matching algorithm calculates a match score based on:
1. How many skills the current user wants to learn that the match offers
2. How many skills the current user offers that the match wants to learn

Score = (matching_offerings + matching_learning) / (total_skills_needed) * 100

Only matches with score > 0 are returned, sorted by score descending.

## Database Schema

### User
- name: String
- email: String (unique)
- password: String (hashed)
- skills_offering: [String]
- skills_learning: [String]
- created_at: Date

### Chat
- user1_id: ObjectId
- user2_id: ObjectId
- created_at: Date

### Message
- chat_id: ObjectId
- sender_id: ObjectId
- text: String
- timestamp: Date

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Security Notes

1. Always change the `JWT_SECRET` in production
2. Use HTTPS in production
3. Set proper CORS origins for production
4. Store MongoDB credentials securely
5. Validate and sanitize all user inputs
