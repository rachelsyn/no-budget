#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 No Budget App Startup Helper');
console.log('================================\n');

// Check if server is already running
function checkServerRunning() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Check if required files exist
function checkSetup() {
  const requiredFiles = [
    'server.js',
    'package.json',
    'client/build/index.html'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
      return false;
    }
  }
  return true;
}

async function startApp() {
  // Check if setup is complete
  if (!checkSetup()) {
    console.log('❌ Setup incomplete. Running setup first...\n');
    console.log('📦 Installing dependencies and building app...');
    
    const setup = spawn('npm', ['run', 'setup'], { 
      stdio: 'inherit',
      shell: true 
    });

    setup.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Setup complete! Starting app...\n');
        startServer();
      } else {
        console.log('\n❌ Setup failed. Please run manually: npm run setup');
        process.exit(1);
      }
    });
    return;
  }

  // Check if server is already running
  const isRunning = await checkServerRunning();
  if (isRunning) {
    console.log('✅ Server is already running on port 5001');
    console.log('\n🌐 You can now visit: http://localhost:5001');
    console.log('\n💡 To stop the server, press Ctrl+C in the terminal where it\'s running');
    return;
  }

  startServer();
}

function startServer() {
  console.log('🚀 Starting No Budget server...\n');
  
  const server = spawn('node', ['server.js'], { 
    stdio: 'inherit',
    shell: true 
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    console.log('\n🔧 Try these solutions:');
    console.log('   1. Check if port 5001 is in use: lsof -ti:5001');
    console.log('   2. Kill conflicting processes: pkill -f "node server.js"');
    console.log('   3. Run setup again: npm run setup');
    process.exit(1);
  });

  // Wait a moment for server to start, then test connection
  setTimeout(async () => {
    const isRunning = await checkServerRunning();
    if (isRunning) {
      console.log('\n🎉 Server started successfully!');
      console.log('\n🌐 Visit your budget tracker at: http://localhost:5001');
      console.log('\n💡 Tips:');
      console.log('   - Keep this terminal open to keep the server running');
      console.log('   - Press Ctrl+C to stop the server');
      console.log('   - If you see "Failed to fetch expenses data", refresh the page');
    } else {
      console.log('\n⚠️  Server may still be starting up...');
      console.log('   Please wait a moment and refresh your browser');
    }
  }, 3000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}

// Run the startup helper
startApp(); 