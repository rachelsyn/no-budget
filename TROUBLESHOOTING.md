# Troubleshooting Guide - "Failed to fetch expenses data"

## 🚨 Most Common Issue: "Failed to fetch expenses data"

This error occurs when the frontend (React app) cannot communicate with the backend (Express server). Here's how to fix it:

### Quick Fix (Try this first)

1. **Run the diagnostic tool:**
   ```bash
   npm run check-setup
   ```

2. **If setup looks good, restart the app:**
   ```bash
   npm start
   ```

3. **Visit the app:**
   ```
   http://localhost:5001
   ```

### Detailed Solutions

#### Solution 1: Complete Setup (Recommended)
```bash
# This installs dependencies and builds the React app
npm run setup

# Validate everything works
npm run validate

# Start the app
npm start
```

#### Solution 2: Development Mode (For developers)
```bash
# This starts both frontend and backend servers
npm run dev-start

# Then visit: http://localhost:3000
```

#### Solution 3: Manual Check
```bash
# Terminal 1: Start backend
npm run dev
# Should show: "Server running on port 5001"

# Terminal 2: Start frontend (in a new terminal)
cd client && npm start
# Should show: "Local: http://localhost:3000"
```

### What Causes This Error?

1. **Backend server not running** - Most common cause
2. **Port conflicts** - Another process using port 5001
3. **Missing dependencies** - Node modules not installed
4. **Build issues** - React app not built properly
5. **Network issues** - Firewall or proxy blocking connections

### How to Verify It's Working

✅ **Success indicators:**
- You see expense categories (Food, Transport, Shopping, etc.)
- You can add new expenses
- No "Failed to fetch" error messages

❌ **Failure indicators:**
- "Failed to fetch expenses data" error
- Blank page or loading spinner that never ends
- Network errors in browser console

### Advanced Troubleshooting

#### Check if backend is running:
```bash
# Test the API directly
curl http://localhost:5001/api/expenses
# Should return JSON data or an empty array []
```

#### Check for port conflicts:
```bash
# On macOS/Linux
lsof -ti:5001
# Should be empty or show your Node.js process

# Kill conflicting processes
pkill -f "node server.js"
```

#### Check Node.js version:
```bash
node --version
# Should be 18.0.0 or higher
```

#### Reinstall dependencies:
```bash
# Remove node_modules and reinstall
rm -rf node_modules client/node_modules
npm run setup
```

### Environment-Specific Issues

#### Windows Users:
- Make sure you're running commands in Command Prompt or PowerShell as Administrator
- Check Windows Firewall settings
- Try using `npm run dev-start` instead of separate terminals

#### macOS Users:
- Check if port 5001 is being used by another app
- Try `sudo lsof -ti:5001` to see what's using the port

#### Linux Users:
- Check if SELinux or AppArmor is blocking the connection
- Verify firewall settings: `sudo ufw status`

### Deployment Issues

If you're deploying to a hosting service (Railway, Heroku, etc.):

1. **Check environment variables:**
   ```bash
   # Set the API URL if needed
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

2. **Verify build process:**
   ```bash
   npm run build
   npm run validate
   ```

3. **Check deployment logs** for any build or runtime errors

### Still Having Issues?

1. **Check the browser console** (F12) for detailed error messages
2. **Run the diagnostic tool:** `npm run check-setup`
3. **Check the server logs** for any error messages
4. **Create a GitHub issue** with:
   - Your operating system
   - Node.js version
   - Error messages from browser console
   - Output from `npm run check-setup`

### Prevention Tips

1. **Always use the recommended setup:**
   ```bash
   npm run setup
   npm start
   ```

2. **For development, use:**
   ```bash
   npm run dev-start
   ```

3. **Keep dependencies updated:**
   ```bash
   npm update
   cd client && npm update
   ```

4. **Backup your data** before major updates:
   ```bash
   cp expenses.json expenses_backup.json
   cp income.json income_backup.json
   ```

---

**Need more help?** Check the main README.md or create an issue on GitHub with the diagnostic output from `npm run check-setup`. 