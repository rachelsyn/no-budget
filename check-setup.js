#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 No Budget Setup Diagnostic Tool');
console.log('=====================================\n');

let issues = [];
let passes = [];

// Check 1: Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  passes.push(`✅ Node.js version: ${nodeVersion} (compatible)`);
} else {
  issues.push(`❌ Node.js version: ${nodeVersion} (need v18+)`);
}

// Check 2: Required files
const requiredFiles = [
  'server.js',
  'package.json',
  'client/package.json',
  'client/src/App.js',
  'client/src/setupProxy.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    passes.push(`✅ Found: ${file}`);
  } else {
    issues.push(`❌ Missing: ${file}`);
  }
});

// Check 3: node_modules
if (fs.existsSync('node_modules')) {
  passes.push('✅ Server dependencies installed');
} else {
  issues.push('❌ Server dependencies not installed (run: npm install)');
}

if (fs.existsSync('client/node_modules')) {
  passes.push('✅ Client dependencies installed');
} else {
  issues.push('❌ Client dependencies not installed (run: cd client && npm install)');
}

// Check 4: React build
if (fs.existsSync('client/build')) {
  passes.push('✅ React app built for production');
} else {
  issues.push('❌ React app not built (run: npm run build)');
}

// Check 5: Data files (optional)
const dataFiles = ['expenses.json', 'income.json', 'categories.json', 'income_categories.json'];
dataFiles.forEach(file => {
  if (fs.existsSync(file)) {
    passes.push(`✅ Data file exists: ${file}`);
  } else {
    passes.push(`ℹ️  Data file will be created: ${file}`);
  }
});

// Check 6: Port availability
exec('lsof -ti:5001', (error, stdout, stderr) => {
  if (stdout.trim()) {
    issues.push('⚠️  Port 5001 is in use (may need to stop existing server)');
  } else {
    passes.push('✅ Port 5001 is available');
  }
  
  // Print results
  console.log('DIAGNOSTIC RESULTS:');
  console.log('==================\n');
  
  if (passes.length > 0) {
    console.log('✅ PASSING CHECKS:');
    passes.forEach(pass => console.log(pass));
    console.log('');
  }
  
  if (issues.length > 0) {
    console.log('❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(issue));
    console.log('');
    
    console.log('🔧 RECOMMENDED FIXES:');
    console.log('===================');
    console.log('1. Run complete setup: npm run setup');
    console.log('2. Validate installation: npm run validate');
    console.log('3. Start the app: npm start');
    console.log('4. If still having issues, check: README.md troubleshooting section\n');
  } else {
    console.log('🎉 ALL CHECKS PASSED!');
    console.log('Your setup looks good. Run "npm start" to launch the app.\n');
  }
});

// Check 7: Quick API test if server is running
exec('curl -s http://localhost:5001/api/expenses', (error, stdout, stderr) => {
  if (!error && stdout.startsWith('[')) {
    console.log('✅ Backend API is responding correctly');
  } else if (error && error.code === 'ENOENT') {
    console.log('ℹ️  curl not available, skipping API test');
  } else {
    console.log('ℹ️  Backend server not currently running (this is normal if not started yet)');
  }
}); 