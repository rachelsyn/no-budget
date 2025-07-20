#!/usr/bin/env node

const http = require('http');

console.log('🔍 Testing No Budget Backend Connection...\n');

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
  console.log('🌐 Testing API endpoints...\n');
  
  const promises = testEndpoints.map(endpoint => testEndpoint(endpoint));
  await Promise.all(promises);
  
  console.log(`\n📊 Results: ${passedTests}/${testEndpoints.length} endpoints working`);
  
  if (passedTests === testEndpoints.length) {
    console.log('\n🎉 All tests passed! Your backend is working correctly.');
    console.log('\n💡 If you still see "Failed to fetch expenses data" in the browser:');
    console.log('   1. Make sure you\'re visiting http://localhost:5001');
    console.log('   2. Try refreshing the page');
    console.log('   3. Check browser console (F12) for errors');
  } else {
    console.log('\n❌ Some tests failed. Your backend server may not be running.');
    console.log('\n🔧 To fix this:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Or run: npm run dev-start (for development)');
    console.log('   3. Then run this test again');
  }
  
  process.exit(passedTests === testEndpoints.length ? 0 : 1);
}

runTests(); 