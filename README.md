# No Budget - Personal Budget Tracker

A simple and intuitive budget tracking application to manage your expenses and income with beautiful charts and analytics.

## ✨ Features

- 📊 Track expenses with categories, dates, and tags
- 💰 Record income from various sources  
- 📈 View financial trends with interactive charts
- 📅 Calendar view of transactions
- 🎯 Quick actions for common tasks
- 💱 Multi-currency support (default: HKD)
- 📱 Clean, responsive web interface

## 🚀 Quick Start (Recommended)

**Prerequisites:** Node.js 18+ and npm 8+ ([Download here](https://nodejs.org/))

1. **Clone this repository**:
   ```bash
   git clone https://github.com/rachelsyn/no-budget.git
   cd no-budget
   ```

2. **One-command setup**:
   ```bash
   npm run setup
   ```

3. **Validate everything works**:
   ```bash
   npm run validate
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

5. **Open your browser** and visit:
   ```
   http://localhost:5001
   ```

🎉 **That's it! Your budget tracker is ready to use.**

## 🛠️ Development Mode

For developers who want to modify the code:

1. **Start both frontend and backend in development mode**:
   ```bash
   npm run dev-start
   ```
   
   This starts:
   - Backend API server on `http://localhost:5001`  
   - Frontend development server on `http://localhost:3000`

2. **Or start them separately**:
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Frontend  
   cd client && npm start
   ```

## 📁 Project Structure

```
no-budget/
├── server.js              # Express backend server
├── client/                # React frontend application
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Styles
│   │   └── setupProxy.js  # Development proxy config
│   └── build/             # Production build (created by setup)
├── *.json                 # Data storage files
└── package.json           # Dependencies and scripts
```

## 💾 Data Storage

Your financial data is stored locally in JSON files:
- `expenses.json` - All expense transactions
- `income.json` - All income transactions  
- `categories.json` - Custom expense categories
- `income_categories.json` - Custom income sources

**Backup tip:** Copy these files to backup your data before updates.

## 🔧 Manual Setup (If Quick Setup Fails)

1. **Install backend dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Build the React frontend**:
   ```bash
   npm run build
   ```

4. **Validate the setup**:
   ```bash
   npm run validate
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

## 🐛 Troubleshooting

### Common Issues & Solutions

**❌ "Error: listen EADDRINUSE: address already in use :::5001"**
```bash
# Kill any processes using port 5001
pkill -f "node server.js"
# Or change the port in server.js
```

**❌ "Cannot GET /" or blank page**
```bash
# The React app wasn't built properly
npm run build
npm start
```

**❌ "Module not found" errors**
```bash
# Dependencies not installed
npm install
cd client && npm install && cd ..
npm run build
```

**❌ "Failed to fetch data" in the app**
```bash
# Backend server not running or API issues
npm run validate  # Check what's wrong
```

**❌ Development mode shows "Proxy error"**
```bash
# Make sure backend is running on port 5001 first
npm run dev  # In one terminal
cd client && npm start  # In another terminal
```

### System Requirements Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version (need 8+)  
npm --version

# Check if ports are free
lsof -ti:5001  # Should be empty
lsof -ti:3000  # Should be empty
```

## 🧪 Testing Your Setup

The `npm run validate` command automatically tests:
- ✅ All required files exist
- ✅ Server starts successfully  
- ✅ All API endpoints respond
- ✅ Frontend build is ready

If validation passes, your app is guaranteed to work!

## 🔄 Updating the App

When you pull new updates from GitHub:

```bash
git pull origin main
npm run setup      # Reinstall dependencies and rebuild
npm run validate   # Make sure everything works
```

## 🚢 Deployment

The app is deployment-ready for platforms like:
- Railway (configuration included)
- Heroku
- Vercel  
- Netlify
- Any Node.js hosting service

The built React app is served by the Express server for simplified deployment.

## 📋 Available Scripts

- `npm run setup` - Complete setup (install + build)
- `npm start` - Start production server  
- `npm run dev` - Start development server
- `npm run dev-start` - Start both frontend & backend in dev mode
- `npm run build` - Build React app for production
- `npm run validate` - Test everything works
- `npm run install-client` - Install frontend dependencies only

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run `npm run validate` to ensure everything works
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

**Need help?** Check the troubleshooting section above or create an issue on GitHub. 