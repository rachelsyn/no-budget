#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing No Budget Backend Connection...\n');

// Check if server is running first
function checkServerStatus() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve({ running: true, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ running: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false, error: 'timeout' });
    });

    req.end();
  });
}

const testEndpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/expenses', name: 'Expenses API' },
  { path: '/api/income', name: 'Income API' },
  { path: '/api/categories', name: 'Categories API' }
];

let completedTests = 0;
let passedTests = 0;

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: endpoint.path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${endpoint.name} - Status: ${res.statusCode}`);
          passedTests++;
        } else {
          console.log(`❌ ${endpoint.name} - Status: ${res.statusCode}`);
        }
        
        completedTests++;
        if (completedTests === testEndpoints.length) {
          resolve();
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${endpoint.name} - Error: ${err.message}`);
      completedTests++;
      if (completedTests === testEndpoints.length) {
        resolve();
      }
    });

    req.on('timeout', () => {
      console.log(`⏰ ${endpoint.name} - Timeout`);
      req.destroy();
      completedTests++;
      if (completedTests === testEndpoints.length) {
        resolve();
      }
    });

    req.end();
  });
}

async function runTests() {
  // First check if server is running
  console.log('🔍 Checking if server is running...');
  const serverStatus = await checkServerStatus();
  
  if (!serverStatus.running) {
    console.log('❌ Server is not running on port 5001');
    console.log('\n🔧 To fix this:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Or run: npm run dev-start (for development)');
    console.log('   3. Then run this test again');
    console.log('\n💡 If you see "Failed to fetch expenses data" in the browser:');
    console.log('   - This is the same issue - the backend server needs to be running');
    console.log('   - The frontend (React app) cannot work without the backend (Express server)');
    console.log('\n📖 For detailed troubleshooting:');
    console.log('   - Run: npm run check-setup');
    console.log('   - Check: TROUBLESHOOTING.md');
    process.exit(1);
  }

  console.log('✅ Server is running on port 5001');
  console.log('\n🌐 Testing API endpoints...\n');
  
  const promises = testEndpoints.map(endpoint => testEndpoint(endpoint));
  await Promise.all(promises);
  
  console.log(`\n📊 Results: ${passedTests}/${testEndpoints.length} endpoints working`);
  
  if (passedTests === testEndpoints.length) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.');
    console.log('\n💡 If you still see "Failed to fetch expenses data" in the browser:');
    console.log('   1. Make sure you\'re visiting http://localhost:5001');
    console.log('   2. Try refreshing the page');
    console.log('   3. Check browser console (F12) for errors');
    console.log('   4. Clear browser cache and try again');
  } else {
    console.log('\n❌ Some tests failed. Your backend server may have issues.');
    console.log('\n🔧 To fix this:');
    console.log('   1. Restart the server: npm start');
    console.log('   2. Check server logs for errors');
    console.log('   3. Run: npm run check-setup');
    console.log('   4. If problems persist, try: npm run setup');
  }
  
  process.exit(passedTests === testEndpoints.length ? 0 : 1);
}

runTests(); 