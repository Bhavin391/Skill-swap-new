# SkillSwap - Setup Verification Checklist

Use this checklist to verify that SkillSwap is properly set up and ready to use.

## Pre-Setup

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB running locally OR MongoDB Atlas account created
- [ ] Code editor open (VS Code recommended)
- [ ] Terminal access available

## Frontend Setup

### Dependencies
- [ ] Run `npm install` in project root
- [ ] No installation errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` updated

### Configuration
- [ ] `app/layout.tsx` exists
- [ ] `app/page.tsx` exists
- [ ] `app/globals.css` has design tokens
- [ ] `tailwind.config.ts` exists
- [ ] `tsconfig.json` exists

### Components
- [ ] `components/ui/button.tsx` exists
- [ ] `components/ui/card.tsx` exists
- [ ] `components/ui/input.tsx` exists
- [ ] Other shadcn components available

### Pages Created
- [ ] `app/page.tsx` - Landing page
- [ ] `app/signup/page.tsx` - Registration
- [ ] `app/login/page.tsx` - Login
- [ ] `app/dashboard/layout.tsx` - Auth wrapper
- [ ] `app/dashboard/page.tsx` - Skills
- [ ] `app/matches/page.tsx` - Find peers
- [ ] `app/chat/page.tsx` - Chat list
- [ ] `app/chat/[id]/page.tsx` - Chat detail
- [ ] `app/profile/page.tsx` - User profile

## Backend Setup

### Installation
- [ ] Navigate to `backend` folder
- [ ] Run `npm install`
- [ ] No installation errors
- [ ] Dependencies installed:
  - [ ] express
  - [ ] mongoose
  - [ ] bcryptjs
  - [ ] jsonwebtoken
  - [ ] cors
  - [ ] dotenv

### Configuration
- [ ] `.env.example` exists in backend folder
- [ ] Copy to `.env` file created
- [ ] Edit `.env` with values:
  - [ ] `PORT=5000`
  - [ ] `MONGO_URI` set (local or Atlas)
  - [ ] `JWT_SECRET` set to random value
  - [ ] `FRONTEND_URL=http://localhost:3000`

### Server File
- [ ] `server.js` exists
- [ ] MongoDB connection setup
- [ ] Routes imported correctly
- [ ] CORS configured
- [ ] Express middleware configured

### Routes Created
- [ ] `routes/auth.js` - Signup/Login
- [ ] `routes/users.js` - User endpoints
- [ ] `routes/matches.js` - Matching algorithm
- [ ] `routes/chat.js` - Chat management
- [ ] `routes/messages.js` - Message handling

## Database Setup

### MongoDB Local
- [ ] MongoDB service running
- [ ] `mongod` process active (if local)
- [ ] Can connect with `mongosh` command

### MongoDB Atlas (Cloud)
- [ ] Account created at atlas.mongodb.com
- [ ] Cluster deployed
- [ ] Database user created
- [ ] IP whitelist updated (or 0.0.0.0/0)
- [ ] Connection string copied
- [ ] Connection string in `backend/.env`

### Collections
- [ ] `users` collection will be created automatically
- [ ] `chats` collection will be created automatically
- [ ] `messages` collection will be created automatically

## Running the Application

### Terminal 1: Backend
- [ ] `cd backend`
- [ ] `npm run dev` executed
- [ ] Output shows:
  ```
  [v0] Connected to MongoDB
  [v0] SkillSwap backend running on port 5000
  ```
- [ ] No errors in console

### Terminal 2: Frontend
- [ ] In new terminal, project root
- [ ] `npm run dev` executed
- [ ] Output shows:
  ```
  ▲ Next.js
  ...
  - ready started server on 0.0.0.0:3000
  ```
- [ ] No errors in console

## Testing the Application

### Landing Page
- [ ] Navigate to `http://localhost:3000`
- [ ] Page loads without errors
- [ ] Hero section visible
- [ ] "Get Started" button visible
- [ ] "Sign In" button visible
- [ ] Features section visible
- [ ] Stats section visible

### Sign Up Flow
- [ ] Click "Get Started"
- [ ] Redirected to signup form
- [ ] Form fields visible:
  - [ ] Full Name
  - [ ] Email
  - [ ] Password
  - [ ] Confirm Password
- [ ] Fill in test data:
  - Name: "Test User"
  - Email: "test@example.com"
  - Password: "test123456"
- [ ] Click "Create Account"
- [ ] Success (should redirect to dashboard)

### Dashboard
- [ ] Dashboard page loads
- [ ] Sidebar navigation visible
- [ ] "Your Skills" heading shown
- [ ] Two skill sections visible:
  - [ ] "Can Teach"
  - [ ] "Want to Learn"
- [ ] Add skill button works
- [ ] Can type and add skills
- [ ] Skills appear in lists

### Adding Skills
- [ ] Add 2-3 skills you can teach (e.g., "Python", "Teaching")
- [ ] Add 2-3 skills you want to learn (e.g., "Spanish", "Design")
- [ ] Click "Save Skills & Find Matches"
- [ ] Confirmation (no errors in console)

### Authentication Test
- [ ] Click "Logout" button
- [ ] Redirected to home page
- [ ] Click "Sign In"
- [ ] Login with test user credentials
- [ ] Successfully logged in

### Matches Page
- [ ] Navigate to "Matches" (may be empty with one user)
- [ ] Matches list loads
- [ ] If no matches: "No matches yet" message shows

### Chat Page
- [ ] Navigate to "Messages"
- [ ] Chat list loads
- [ ] If no chats: "No messages yet" message shows

### Profile Page
- [ ] Navigate to "Profile"
- [ ] User info displayed:
  - [ ] Name
  - [ ] Email
  - [ ] Added skills visible
- [ ] "Update Skills" button works

## API Testing

### Test Backend Endpoints
- [ ] Use Postman or curl to test:

```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test2@example.com","password":"test123456"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

- [ ] Signup returns token
- [ ] Login returns token
- [ ] Error responses formatted correctly

## Browser Console

- [ ] No errors in browser console (F12)
- [ ] No 404s for resources
- [ ] No CORS errors
- [ ] No authentication errors

## Network Requests

- [ ] Open DevTools (F12) → Network tab
- [ ] Sign up and observe:
  - [ ] POST to `/api/auth/signup` returns 200
  - [ ] Response includes token
  - [ ] Dashboard page loads
- [ ] Update skills and observe:
  - [ ] PUT to `/api/users/me/skills` returns 200

## Responsive Design

- [ ] Test on different screen sizes (DevTools)
- [ ] Mobile (375px):
  - [ ] Navigation collapses properly
  - [ ] Skills cards stack vertically
  - [ ] Forms are usable
- [ ] Tablet (768px):
  - [ ] Two-column layout works
  - [ ] Elements properly spaced
- [ ] Desktop (1920px):
  - [ ] Full layout works
  - [ ] Max-width containers centered

## Performance

- [ ] Frontend loads in < 3 seconds
- [ ] Backend responds in < 500ms
- [ ] Chat refreshes smoothly
- [ ] No lag when typing messages
- [ ] Skills update quickly

## Documentation

- [ ] `README.md` exists and readable
- [ ] `SETUP.md` exists with detailed instructions
- [ ] `QUICKSTART.md` exists with quick start
- [ ] `PROJECT_SUMMARY.md` exists with overview
- [ ] `backend/README.md` exists with API docs
- [ ] This checklist (`VERIFICATION_CHECKLIST.md`) exists

## Error Handling

- [ ] Try signup with existing email → Error shown
- [ ] Try login with wrong password → Error shown
- [ ] Try accessing dashboard without login → Redirected to login
- [ ] Try adding empty skill → Rejected or handled
- [ ] Try sending empty message → Rejected or handled

## Security

- [ ] JWT token stored in localStorage (after login)
- [ ] Token sent in Authorization header for protected routes
- [ ] Password hashed in database (not plain text)
- [ ] CORS headers allow frontend → backend communication
- [ ] .env file not committed to git (check .gitignore)

## Ready for Development

Once all items are checked:

- [ ] SkillSwap fully functional
- [ ] Ready to customize further
- [ ] Ready to deploy
- [ ] Ready for production use

## Troubleshooting

If any item fails, check:
1. **MongoDB Connection**: Verify MongoDB is running
2. **Port Conflicts**: Ensure ports 3000 and 5000 are available
3. **Environment Variables**: Check `.env` file values
4. **Dependencies**: Run `npm install` again
5. **Browser Cache**: Clear cache (Ctrl+Shift+Delete)
6. **Console Errors**: Check browser and terminal output

See [SETUP.md](SETUP.md#troubleshooting) for detailed troubleshooting.

## Next Steps

After verification:
1. Create more test users to test matching
2. Test skill matching with multiple users
3. Explore chat functionality between accounts
4. Review code for customizations
5. Plan deployment strategy
6. Read API documentation for extensions

---

**Congratulations!** If you've checked all items, SkillSwap is fully set up and ready to use! 🎉

For questions, see [README.md](README.md) or [SETUP.md](SETUP.md)
