const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating No Budget App Setup...\n');

// Test if all required files exist
const requiredFiles = [
  'server.js',
  'package.json',
  'client/package.json',
  'client/build/index.html',
  'categories.json',
  'income_categories.json',
  'expenses.json',
  'income.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Setup incomplete. Please run: npm run setup');
  process.exit(1);
}

// Test server startup
console.log('\n🚀 Testing server startup...');
const server = require('./server.js');

// Wait a moment for server to start
setTimeout(() => {
  // Test API endpoints
  const testEndpoints = [
    '/api/categories',
    '/api/income-categories',
    '/api/expenses',
    '/api/income'
  ];

  console.log('\n🌐 Testing API endpoints...');
  let completedTests = 0;
  let passedTests = 0;

  testEndpoints.forEach(endpoint => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: endpoint,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${endpoint} - Status: ${res.statusCode}`);
          passedTests++;
        } else {
          console.log(`❌ ${endpoint} - Status: ${res.statusCode}`);
        }
        
        completedTests++;
        if (completedTests === testEndpoints.length) {
          console.log(`\n📊 Results: ${passedTests}/${testEndpoints.length} endpoints working`);
          
          if (passedTests === testEndpoints.length) {
            console.log('\n🎉 All tests passed! Your No Budget app is ready to use.');
            console.log('\n🚀 To start the app:');
            console.log('   npm start');
            console.log('\n🌐 Then visit: http://localhost:5001');
            console.log('\n👩‍💻 For development mode:');
            console.log('   npm run dev-start');
          } else {
            console.log('\n❌ Some tests failed. Please check the setup.');
          }
          
          process.exit(passedTests === testEndpoints.length ? 0 : 1);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${endpoint} - Error: ${err.message}`);
      completedTests++;
      if (completedTests === testEndpoints.length) {
        console.log('\n❌ Server connection failed. Make sure the server is running.');
        process.exit(1);
      }
    });

    req.end();
  });
}, 2000);