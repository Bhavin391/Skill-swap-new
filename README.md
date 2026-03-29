# SkillSwap - Peer-to-Peer Skill Exchange Platform

A modern, full-stack web application where users can connect with peers to exchange skills. Find people who want to learn what you know, and learn what they know.

![SkillSwap](https://img.shields.io/badge/Next.js-16-black?style=flat-square) ![Express](https://img.shields.io/badge/Express-4.18-green?style=flat-square) ![MongoDB](https://img.shields.io/badge/MongoDB-4.0+-green?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## Quick Links

- **[Quick Start Guide](QUICKSTART.md)** - Get running in 5 minutes
- **[Complete Setup Guide](SETUP.md)** - Detailed installation & configuration
- **[Project Summary](PROJECT_SUMMARY.md)** - Features, architecture & technology
- **[Backend README](backend/README.md)** - API documentation & deployment

## Features

✨ **User Authentication**
- Secure signup and login with JWT
- Password hashing with bcryptjs
- Protected routes and API endpoints

🎯 **Skill Matching**
- Intelligent algorithm to find compatible peers
- Match score based on skill complementarity
- Ranked by compatibility percentage

💬 **Real-time Messaging**
- One-on-one chat with matched peers
- View peer's skills in chat interface
- Message history persistence

👤 **User Profiles**
- Manage skills you can teach
- Manage skills you want to learn
- View other users' profiles

📱 **Responsive Design**
- Mobile-first design approach
- Works on all screen sizes
- Modern, clean UI with Tailwind CSS

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TypeScript** - Type safety
- **Lucide Icons** - Icon library

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Database ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites
- Node.js 16 or higher
- npm/yarn/pnpm
- MongoDB 4.0+ (local or cloud)

### Quick Start (5 minutes)

1. **Clone and Install**
```bash
npm install
cd backend && npm install
```

2. **Configure Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

3. **Start Frontend** (New terminal)
```bash
npm run dev
```

4. **Open Browser**
Navigate to `http://localhost:3000` and start skill swapping!

For detailed setup instructions, see [SETUP.md](SETUP.md)

## Project Structure

```
SkillSwap/
├── app/                          # Next.js pages
│   ├── page.tsx                 # Landing page
│   ├── signup/page.tsx          # Registration
│   ├── login/page.tsx           # Login
│   ├── dashboard/page.tsx       # Skill management
│   ├── matches/page.tsx         # Find peers
│   ├── chat/                    # Messaging
│   └── profile/page.tsx         # User profile
│
├── backend/                      # Express API
│   ├── routes/                  # API endpoints
│   ├── server.js                # Express setup
│   └── package.json
│
├── components/ui/               # shadcn components
├── SETUP.md                     # Complete guide
├── QUICKSTART.md                # Quick start
└── PROJECT_SUMMARY.md           # Full overview
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/users/me` | Get profile |
| PUT | `/api/users/me/skills` | Update skills |
| GET | `/api/matches` | Find matches |
| GET | `/api/chats` | List chats |
| GET | `/api/chats/:id` | Get chat |
| POST | `/api/messages` | Send message |

See [Backend README](backend/README.md) for complete API documentation.

## How It Works

1. **Sign Up** - Create an account with your name and email
2. **Add Skills** - Tell us what you can teach and want to learn
3. **Find Matches** - View compatible peers sorted by match score
4. **Chat** - Message peers to arrange skill exchanges
5. **Learn & Teach** - Exchange knowledge with your learning partners

### Matching Algorithm

The app uses a smart algorithm to find the best matches:

```
Match Score = (
  Skills you want that they offer +
  Skills you offer that they want
) / Total skills × 100
```

Only matches with complementary skills are shown, ranked by score.

## Design System

### Colors
- **Primary**: Indigo (#6366f1) - Modern and tech-forward
- **Secondary**: Light Blue (#E0E7FF) - Complementary
- **Foreground**: Dark (#15101B) - Text
- **Background**: White (#FAFAF8) - Base
- **Accent**: Indigo (matches primary) - Highlights

### Typography
- **Sans**: Geist - Clean and readable
- **Mono**: Geist Mono - Code/data

## Authentication

- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - Passwords hashed with bcryptjs
- **Protected Routes** - Middleware validates tokens
- **Token Storage** - Stored in localStorage (use httpOnly cookies in production)

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  skills_offering: [String],
  skills_learning: [String],
  created_at: Date
}
```

### Chat
```javascript
{
  user1_id: ObjectId,
  user2_id: ObjectId,
  created_at: Date
}
```

### Message
```javascript
{
  chat_id: ObjectId,
  sender_id: ObjectId,
  text: String,
  timestamp: Date
}
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import on Vercel
3. Deploy automatically

### Backend (Railway/Render/Heroku)
1. Deploy from GitHub
2. Add MongoDB Atlas database
3. Set environment variables

See [SETUP.md](SETUP.md#deployment) for detailed deployment instructions.

## Development

### Running Tests
```bash
# Frontend
npm run test

# Backend
cd backend && npm test
```

### Building for Production
```bash
# Frontend
npm run build
npm start

# Backend
npm start
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- For Atlas, verify IP whitelist

### CORS Errors
- Verify backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env`

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Token Issues
- Clear localStorage: DevTools → Application → Clear All
- Login again
- Verify JWT_SECRET matches

See [SETUP.md](SETUP.md#troubleshooting) for comprehensive troubleshooting guide.

## Performance

- **Frontend**: Next.js automatic code splitting & optimization
- **Backend**: Stateless API with database indexing
- **Chat**: 2-second refresh interval (configurable)
- **Matches**: Limited to top 20 results per query

## Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Token verification middleware
- ⚠️ Store JWT in httpOnly cookies in production
- ⚠️ Use HTTPS in production
- ⚠️ Restrict CORS origins in production

## Future Enhancements

- [ ] Email verification
- [ ] User ratings/reviews
- [ ] Video calling
- [ ] Scheduling system
- [ ] Mobile app
- [ ] Gamification
- [ ] Progress tracking
- [ ] Skill endorsements

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

Need help? Check out:
1. [Quick Start Guide](QUICKSTART.md) - 5-minute setup
2. [Complete Setup Guide](SETUP.md) - Detailed instructions
3. [Project Summary](PROJECT_SUMMARY.md) - Features & architecture
4. [Backend README](backend/README.md) - API reference

## Built With

- [v0 by Vercel](https://v0.dev) - AI-powered development
- [Next.js](https://nextjs.org) - React framework
- [Express](https://expressjs.com) - Web framework
- [MongoDB](https://www.mongodb.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - Components

## Changelog

### v1.0.0 (Initial Release)
- User authentication system
- Skill profile management
- Peer matching algorithm
- Real-time messaging
- Responsive design
- Complete API
- Full documentation

---

**Start skill swapping today!** 🚀

[Get Started](QUICKSTART.md) | [Learn More](PROJECT_SUMMARY.md) | [Setup Guide](SETUP.md)

Built with ❤️ for learners everywhere
"# Skill-swap" 
"# Skill-swap-new" 
