# No Budget - Personal Budget Tracker

A simple and intuitive budget tracking application to manage your expenses and income with beautiful charts and analytics.

## ✨ Features

- 📊 **Expense Tracking**: Categorize expenses with dates, descriptions, and custom tags
- 💰 **Income Management**: Record income from various sources with detailed categorization
- 📈 **Interactive Charts**: View financial trends with beautiful, responsive visualizations
- 📅 **Calendar View**: See your transactions organized by date
- 🎯 **Quick Actions**: Streamlined interface for common tasks (recently improved!)
- 💱 **Multi-currency Support**: Default HKD with easy currency customization
- 📱 **Responsive Design**: Clean, modern interface that works on all devices
- 🔄 **Recently Updated**: Enhanced code maintainability and improved user experience

## 🚀 Quick Start (Recommended)

> **⚠️ IMPORTANT:** This app requires BOTH a backend server AND frontend to work. The "Failed to fetch expenses data" error occurs when only one part is running. Follow these steps exactly:

**Prerequisites:** Node.js 18+ and npm 8+ ([Download here](https://nodejs.org/))

1. **Clone this repository**:
   ```bash
   git clone https://github.com/rachelsyn/no-budget.git
   cd no-budget
   ```

2. **One-command setup** (installs dependencies + builds React app):
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

> **✅ Success indicators:** You should see your expense categories (Food, Transport, etc.) and any existing data. If you see "Failed to fetch expenses data", check the troubleshooting section below.

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
│   │   ├── App.css        # Styles and responsive design
│   │   └── setupProxy.js  # Development proxy config
│   └── build/             # Production build (created by setup)
├── expenses.json          # Expense data storage
├── income.json           # Income data storage
├── categories.json       # Custom expense categories
├── income_categories.json # Custom income sources
└── package.json          # Dependencies and scripts
```

## 💾 Data Storage

Your financial data is stored locally in JSON files:
- `expenses.json` - All expense transactions
- `income.json` - All income transactions  
- `categories.json` - Custom expense categories
- `income_categories.json` - Custom income sources

**💡 Backup tip:** Copy these files to backup your data before updates.

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

**❌ "Failed to fetch expenses data" (MOST COMMON ISSUE)**
This happens when the frontend can't communicate with the backend server:

```bash
# SOLUTION 1: Run the diagnostic tool first
npm run check-setup
# This will tell you exactly what's wrong

# SOLUTION 2: Use the recommended setup command
npm run setup
npm start

# SOLUTION 3: For development, start BOTH servers
npm run dev-start
# This starts backend (port 5001) AND frontend (port 3000)

# SOLUTION 4: Manual check
# Make sure backend is running:
npm run dev  # Should show "Server running on port 5001"
# Then in another terminal:
cd client && npm start
```

**✅ How to verify it's working:**
- Visit http://localhost:5001 (production) or http://localhost:3000 (development)
- You should see your expense categories and data
- If you see "Failed to fetch" errors, the backend server is not running

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
lsof -ti:3000  # Should be empty (dev mode only)
```

## 🧪 Testing Your Setup

The `npm run validate` command automatically tests:
- ✅ All required files exist
- ✅ Server starts successfully  
- ✅ All API endpoints respond correctly
- ✅ Frontend build is ready to serve

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
- **Railway** (configuration included - `railway.json`)
- **Heroku** 
- **Vercel**  
- **Netlify**
- **Any Node.js hosting service**

The built React app is served by the Express server for simplified deployment. **No separate frontend deployment needed!**

## 📋 Available Scripts

- `npm run setup` - Complete setup (install + build)
- `npm start` - Start production server  
- `npm run dev` - Start development server
- `npm run dev-start` - Start both frontend & backend in dev mode
- `npm run build` - Build React app for production
- `npm run validate` - Test everything works
- `npm run check-setup` - Diagnostic tool to identify setup issues
- `npm run install-client` - Install frontend dependencies only

## 🤝 Contributing

We welcome contributions! This project is actively maintained and recently refactored for better code quality.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Run `npm run validate` to ensure everything works
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Recent improvements include:**
- 🔧 Code refactoring for better maintainability
- 🎯 Enhanced quick actions functionality
- 🐛 Bug fixes for UI components
- 📱 Improved responsive design

## 📄 License

This project is licensed under the ISC License.

## 🆕 What's New

- **Enhanced Code Quality**: Recent major refactoring reduces redundancy and improves maintainability
- **Improved Quick Actions**: Fixed interference issues and better button handling
- **Better Navigation**: Enhanced View Trends functionality and sidebar improvements
- **Cleaner UI**: Removed unused styles and improved overall design consistency

---

**Need help?** Check the troubleshooting section above or create an issue on GitHub. This project is actively maintained and we respond quickly to issues! 🚀 