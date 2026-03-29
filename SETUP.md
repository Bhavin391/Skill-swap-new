# SkillSwap - Complete Setup Guide

## Project Overview

SkillSwap is a peer-to-peer skill exchange platform where users can:
- Create profiles with skills they can teach and skills they want to learn
- Find matches based on complementary skills
- Chat with matched peers to arrange skill exchanges

## Architecture

```
SkillSwap
├── Frontend (Next.js 16 + React)
│   ├── app/
│   │   ├── page.tsx (Landing)
│   │   ├── signup/
│   │   ├── login/
│   │   ├── dashboard/ (Skills management)
│   │   ├── matches/ (Find peers)
│   │   ├── chat/ (Messaging)
│   │   └── profile/
│   └── components/ (Shadcn UI components)
│
└── Backend (Express.js + MongoDB)
    ├── routes/
    │   ├── auth.js (Authentication)
    │   ├── users.js (User management)
    │   ├── matches.js (Skill matching algorithm)
    │   ├── chat.js (Chat management)
    │   └── messages.js (Message handling)
    └── server.js (Express setup)
```

## Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB 4.0+ (local or cloud: MongoDB Atlas)
- A code editor (VS Code recommended)

## Step 1: Frontend Setup

### 1.1 Install Frontend Dependencies

```bash
# From project root
npm install
# or
yarn install
# or
pnpm install
```

This installs all frontend dependencies including Next.js, React, Tailwind, shadcn/ui, and axios.

### 1.2 Verify Frontend Structure

The frontend structure is already created:
```
app/
├── page.tsx (Landing page)
├── signup/page.tsx (Signup form)
├── login/page.tsx (Login form)
├── dashboard/
│   ├── layout.tsx (Auth wrapper)
│   └── page.tsx (Skills management)
├── matches/page.tsx (Find matches)
├── chat/
│   ├── page.tsx (Conversations list)
│   └── [id]/page.tsx (Chat interface)
└── profile/page.tsx (User profile)
```

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- express - Web framework
- mongoose - MongoDB ORM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - CORS middleware
- dotenv - Environment variables

### 2.2 MongoDB Setup

**Option A: Local MongoDB**
```bash
# On Mac (with Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB from Services or run: mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Use it in `.env` file

### 2.3 Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
```

For MongoDB Atlas, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
```

### 2.4 Start Backend Server

```bash
# From backend directory
npm run dev
```

You should see:
```
[v0] Connected to MongoDB
[v0] SkillSwap backend running on port 5000
```

## Step 3: Frontend Development

### 3.1 Start Frontend Dev Server

```bash
# From project root
npm run dev
```

The app opens at `http://localhost:3000`

### 3.2 Test the Application

1. **Visit Landing Page**: http://localhost:3000
2. **Sign Up**: Click "Get Started" and create an account
3. **Add Skills**: Go to Dashboard and add skills you can teach and want to learn
4. **Find Matches**: Go to Matches to see compatible peers
5. **Chat**: Click "Send Message" to start chatting

## API Endpoints Reference

### Authentication
```
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Users
```
GET /api/users/me (Requires token)
PUT /api/users/me/skills (Requires token)
{
  "skills_offering": ["Python", "JavaScript"],
  "skills_learning": ["Spanish", "Design"]
}

GET /api/users/:id
```

### Matches
```
GET /api/matches (Requires token)
Returns: [{ _id, name, email, skills_offering, skills_learning, match_score }]
```

### Chats
```
GET /api/chats (Requires token)
GET /api/chats/:chatId (Requires token)
POST /api/chats/init/:userId (Requires token)
```

### Messages
```
POST /api/messages (Requires token)
{
  "chat_id": "...",
  "text": "Hello!"
}

GET /api/messages/chat/:chatId (Requires token)
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Go to https://vercel.com
3. Import the project
4. Set environment variables if needed
5. Deploy

### Backend (Heroku/Railway/Render)

**Using Railway:**
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub
4. Add MongoDB addon
5. Set environment variables

**Using Render:**
1. Go to https://render.com
2. Create new Web Service
3. Deploy from GitHub
4. Set environment variables
5. Deploy

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify `MONGO_URI` in `.env`
- For Atlas, check whitelist IP address

### CORS Errors
- Make sure backend is running on port 5000
- Verify `FRONTEND_URL` in backend `.env`
- Check browser console for exact error

### Token Issues
- Clear localStorage: Open DevTools → Application → Storage → Clear All
- Check JWT_SECRET matches between frontend and backend
- Verify token is being sent in Authorization header

### Port Already in Use
```bash
# Kill process on port 5000
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Default Test Data

After starting the backend, you can create test users via signup. Some example skills to try:

**User 1:**
- Can Teach: Python, JavaScript
- Wants to Learn: Spanish, Design

**User 2:**
- Can Teach: Design, Spanish
- Wants to Learn: Python, JavaScript

This creates a perfect complementary match!

## Performance Tips

1. **Frontend Caching**: Messages auto-refresh every 2 seconds (configurable)
2. **Matching Algorithm**: Limited to top 20 matches per query
3. **Database Indexing**: Add indexes on frequently queried fields in production
4. **Pagination**: Implement for large chat histories

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable CORS only for trusted domains
- [ ] Validate all user inputs
- [ ] Hash passwords with bcrypt
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add request validation middleware

## File Structure

```
skillswap-project/
├── app/
│   ├── page.tsx
│   ├── signup/
│   ├── login/
│   ├── dashboard/
│   ├── matches/
│   ├── chat/
│   ├── profile/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/ (shadcn components)
├── backend/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── package.json
├── tailwind.config.ts
└── SETUP.md (this file)
```

## Next Steps

1. Deploy to Vercel (frontend)
2. Deploy to Railway/Render (backend)
3. Add MongoDB Atlas for production database
4. Implement email verification
5. Add user reviews/ratings
6. Implement scheduling system
7. Add video call integration
8. Enhance matching algorithm

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `npm run dev`
3. Check browser console for frontend errors
4. Check MongoDB connection
5. Verify all environment variables

## License

MIT

Happy skill swapping! 🚀
