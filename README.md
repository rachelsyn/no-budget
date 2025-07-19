# No Budget - Personal Budget Tracker

A simple and intuitive budget tracking application to manage your expenses and income.

## Features

- Track expenses with categories, dates, and descriptions
- Record income from various sources
- Manage custom expense and income categories
- View financial summaries and trends
- Clean, responsive web interface

## Quick Setup

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Clone or download this project**

3. **Install and build everything**:
   ```bash
   npm run setup
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:5001
   ```

## Manual Setup (if quick setup doesn't work)

1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

3. Build the frontend:
   ```bash
   cd client
   npm run build
   cd ..
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Development Mode

If you want to work on the code:

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In another terminal, start the frontend development server:
   ```bash
   cd client
   npm start
   ```

This will run the frontend on `http://localhost:3000` and backend on `http://localhost:5001`.

## Data Storage

Your data is stored in JSON files in the project directory:
- `expenses.json` - Your expense records
- `income.json` - Your income records
- `categories.json` - Custom expense categories
- `income_categories.json` - Custom income categories

## Troubleshooting

- **Error about build folder**: Run `npm run build` to build the React app first
- **Port already in use**: Change the PORT in server.js or kill the process using port 5001
- **Module not found**: Make sure you've run `npm install` in both the root directory and client directory 