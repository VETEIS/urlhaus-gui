// Full-stack application test script
const axios = require('axios');

async function testFullStack() {
  console.log('🧪 Testing Full-Stack URLhaus Application...\n');
  
  try {
    // Test 1: Backend Health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend is running:', healthResponse.data.message);
    
    // Test 2: Redis Connection
    console.log('\n2. Testing Redis Connection...');
    const redisTest = await axios.get('http://localhost:3001/api/v1/cache/clear');
    console.log('✅ Redis is working:', redisTest.data.message);
    
    // Test 3: Frontend (if running)
    console.log('\n3. Testing Frontend...');
    try {
      const frontendResponse = await axios.get('http://localhost:5173');
      console.log('✅ Frontend is running on port 5173');
    } catch (error) {
      console.log('⚠️  Frontend not running - start it with: npm run dev');
    }
    
    console.log('\n🎉 Full-Stack Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Enter your URLhaus API key');
    console.log('3. Test the refresh and search functionality');
    console.log('4. Notice the faster responses due to caching!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Redis is running: cd C:\\Redis && redis-server.exe');
    console.log('2. Backend is running: cd backend && npm start');
    console.log('3. Frontend is running: npm run dev');
  }
}

testFullStack();
