// Simple Redis connection test
const Redis = require('ioredis');

async function testRedis() {
  console.log('🧪 Testing Redis connection...\n');
  
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Test connection
    await redis.ping();
    console.log('✅ Redis connection successful!');
    
    // Test set/get
    await redis.set('test-key', 'Hello Redis!');
    const value = await redis.get('test-key');
    console.log('✅ Redis set/get test:', value);
    
    // Test cache service
    const { cacheService } = require('./dist/utils/redis');
    await cacheService.set('test-cache', { message: 'Cache works!' }, 5000);
    const cached = await cacheService.get('test-cache');
    console.log('✅ Cache service test:', cached);
    
    // Cleanup
    await redis.del('test-key');
    await redis.del('test-cache');
    
    console.log('\n🎉 Redis is working perfectly!');
    console.log('💡 Your backend will now have full caching functionality.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('\n💡 Redis setup options:');
    console.log('1. Download Redis for Windows: https://github.com/microsoftarchive/redis/releases');
    console.log('2. Install WSL2 and Redis: wsl --install && sudo apt install redis-server');
    console.log('3. Use Docker: docker run -d -p 6379:6379 redis:alpine');
    console.log('\n⚠️  Backend will work without Redis (caching disabled)');
    process.exit(1);
  }
}

testRedis();
