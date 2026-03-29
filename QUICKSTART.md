# SkillSwap - Quick Start Guide (5 Minutes)

Get SkillSwap running locally in just 5 minutes!

## ⚡ Prerequisites

- Node.js 16+ installed ([Download](https://nodejs.org))
- MongoDB running locally OR MongoDB Atlas account (free at mongodb.com/cloud/atlas)
- Terminal/Command Prompt access
- Port 3000 & 5000 available

## 🚀 Step 1: Install Frontend Dependencies (1 minute)

```bash
# In the root directory
npm install
```

## 🔧 Step 2: Setup & Start Backend (2 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file (copy template)
cp .env.example .env

# IMPORTANT: Edit .env file with your MongoDB connection
```

**Configure MongoDB in `backend/.env`:**

**Option A - Local MongoDB:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017
DB_NAME=skillswap
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dev_secret_key_change_in_production
```

**Option B - MongoDB Atlas (Cloud - Recommended):**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account & cluster
3. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
4. Update .env:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=skillswap
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dev_secret_key_change_in_production
```

**Start Backend:**
```bash
npm run dev
```

✅ Backend running on `http://localhost:5000`  
Look for: `[v0] Connected to MongoDB` and `[v0] SkillSwap backend running on http://localhost:5000`

## 🎨 Step 3: Start Frontend (1 minute)

**Open a NEW terminal window** and run:

```bash
# From root directory (NOT backend folder)
npm run dev
```

✅ Frontend running on `http://localhost:3000`

## 📝 Step 4: Create Your Account (1 minute)

1. Open http://localhost:3000 in browser
2. Click **"Start Free Today"** button
3. Sign up with:
   - **Name:** Your name
   - **Email:** yourname@test.com
   - **Password:** At least 6 characters

## ✨ Step 5: Try It Out (1 minute)

### Add Skills to Your Profile:
1. You'll be redirected to **Dashboard** after signup
2. Under **"Can Teach"** - Add skills you know (e.g., "Python", "Guitar", "Photography")
3. Under **"Want to Learn"** - Add skills you want (e.g., "JavaScript", "Spanish", "Cooking")
4. Click **"Save Skills & Find Matches"**

### Find Learning Partners:
1. Click **"Matches"** in the header
2. Browse users with complementary skills
3. Click **"Connect & Learn"** on anyone you want to chat with

### Start Messaging:
1. Click **"Messages"** in the header
2. Click a conversation to open chat
3. Type and send messages in real-time

## 🐛 Troubleshooting

### ❌ "Backend server not responding"

**Check if backend is running:**
```bash
# Should see: [v0] Connected to MongoDB
# And: [v0] SkillSwap backend running on http://localhost:5000
```

**If not, try:**
```bash
# Kill port 5000 if something else is using it
lsof -ti:5000 | xargs kill -9

# Or on Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Restart backend
cd backend && npm run dev
```

### ❌ "MongoDB connection error"

**Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows - MongoDB should auto-start
# Or check Services app
```

**MongoDB Atlas (Cloud):**
- ✅ Verify connection string in `backend/.env`
- ✅ Add your IP to Atlas Network Access (Dashboard → Security → Network Access)
- ✅ Check username & password are correct
- ✅ Database user exists with proper permissions

### ❌ "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9

# Or on Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ❌ "Login failed / User already exists"
1. Clear browser storage: Press F12 → **Application** tab → **Clear All**
2. Try signing up with a different email
3. Verify MongoDB is connected (check backend terminal)

### ❌ "No matches showing"
- You need **at least 2 users** with complementary skills
- Signup twice (different emails) to test matching
- Add different skills to each user
- Check match score calculation works

## 📁 Project Structure

```
skill-swap/
├── app/                          # Next.js Frontend Pages
│   ├── page.tsx                 # Landing/Home page
│   ├── login/page.tsx           # Login form
│   ├── signup/page.tsx          # Registration form
│   ├── dashboard/page.tsx       # Manage your skills
│   ├── matches/page.tsx         # Browse learning partners
│   ├── chat/page.tsx            # Messages list
│   ├── chat/[id]/page.tsx       # Individual chat
│   ├── profile/page.tsx         # View your profile
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/
│   ├── header.tsx               # Navigation header
│   └── ui/                      # Shadcn UI components
│
├── lib/
│   └── api-client.ts            # API request utility
│
├── backend/                      # Express.js API Server
│   ├── server.js                # Main server file
│   ├── routes/
│   │   ├── auth.js              # Login/Signup endpoints
│   │   ├── users.js             # User profile endpoints
│   │   ├── matches.js           # Skill matching endpoint
│   │   ├── chat.js              # Chat endpoints
│   │   └── messages.js          # Message endpoints
│   ├── package.json
│   ├── .env.example             # Template for config
│   └── .env                     # Your config (create this)
│
├── .env.local                   # Frontend config
├── package.json
├── QUICKSTART.md                # This file
├── SETUP.md                     # Detailed setup guide
└── README.md                    # Full documentation
```

## 🔑 Key Features Tested

| Feature | How to Test |
|---------|------------|
| **Signup** | Click "Start Free Today" → Fill form → Submit |
| **Login** | Go to /login → Enter credentials |
| **Add Skills** | Dashboard → Enter skills → Save |
| **Matching** | Matches page → See users with complementary skills |
| **Messaging** | Messages page → Select chat → Send messages |
| **Profiles** | Profile page → View your details & skills |
| **Logout** | Header → Click Logout button |

## 🔐 Authentication

- **JWT Tokens** - Secure token-based auth
- **Password Hashing** - bcryptjs hashing
- **Token Storage** - localStorage (use httpOnly cookies in production)
- **Token Expiry** - 30 days

## 📊 Matching Algorithm

```
Match Score = (Skills you want that they offer + 
               Skills you offer that they want) / 
              Total of your skills × 100

Example:
- You: Want JavaScript, Python (2 skills), Know Spanish (1)
- Them: Know JavaScript, React (2), Want Spanish (1)
- Match: JavaScript overlap + Spanish overlap = 2/3 = 67%
```

## 🌍 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (backend/.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017
DB_NAME=skillswap
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secret_key_here
```

## 📞 Common Commands

```bash
# Frontend
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm start                # Run production build

# Backend
cd backend
npm run dev              # Start with auto-reload
npm start                # Start production

# Database
# macOS
brew services start mongodb-community
brew services stop mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl stop mongod
```

## ✅ Verification Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] `npm install` completed in root
- [ ] `cd backend && npm install` completed
- [ ] `backend/.env` created and configured
- [ ] Backend running on localhost:5000
- [ ] Frontend running on localhost:3000
- [ ] Can create account
- [ ] Can add skills
- [ ] Can see matches (if 2+ users exist)
- [ ] Can send messages between users

## 🎯 Next Steps

After verification:

1. **Create test accounts** - Sign up with 2+ different emails
2. **Add different skills** - Create diversity for matching
3. **Test messaging** - Switch between accounts to test chat
4. **Read full docs** - See README.md and SETUP.md
5. **Deploy** - See SETUP.md for deployment instructions

## 🔗 Useful Links

- [Full Setup Guide](SETUP.md) - Detailed deployment & config
- [README](README.md) - Complete documentation
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database
- [Next.js Docs](https://nextjs.org/docs) - Frontend framework
- [Express Docs](https://expressjs.com/) - Backend framework

## 🆘 Still Having Issues?

1. **Check terminal logs** - Look for error messages in both terminals
2. **Verify ports** - Make sure 3000 and 5000 are available
3. **Clear cache** - F12 → Application → Clear All → Refresh
4. **Restart services** - Kill both servers and restart
5. **Check .env files** - Ensure MongoDB URI and API URL are correct
6. **Read full SETUP.md** - For comprehensive troubleshooting guide

---

**You're ready! Happy skill swapping! 🚀**

Questions? Check [SETUP.md](SETUP.md) for comprehensive guide or [README.md](README.md) for full docs.
