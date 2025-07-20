# Quick Setup Guide for GitHub Users

If you just cloned this repository and are seeing **"Failed to fetch expenses data"**, follow these steps:

## 🚨 Most Common Issue: Backend Server Not Running

This app has **two parts** that must both run:
1. **Backend server** (Express.js on port 5001) - serves the API
2. **Frontend** (React app) - the user interface

The error occurs when only one part is running.

## ✅ Quick Fix (30 seconds)

```bash
# 1. Run the diagnostic tool to see what's wrong
npm run check-setup

# 2. One-command fix for most issues
npm run setup

# 3. Start the app
npm start

# 4. Open http://localhost:5001 in your browser
```

## 🔧 If That Doesn't Work

```bash
# Manual setup:
npm install                    # Install backend dependencies
cd client && npm install      # Install frontend dependencies  
cd .. && npm run build       # Build the React app
npm start                     # Start the server

# For development with hot reload:
npm run dev-start             # Starts both servers
# Then visit http://localhost:3000
```

## ❓ Still Having Issues?

1. Check the main [README.md](README.md) troubleshooting section
2. Run `npm run check-setup` to see what's missing
3. Make sure you have Node.js 18+ installed
4. Check that ports 3000 and 5001 aren't in use by other apps

## ✅ Success Indicators

When working correctly, you should see:
- Your expense categories (Food, Transport, Entertainment, etc.)
- Any existing expense data
- No "Failed to fetch" error messages
- Charts and analytics working

Happy budgeting! 💰 