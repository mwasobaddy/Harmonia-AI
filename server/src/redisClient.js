// Shared Redis client for the entire application
const redis = require('redis');

// Debug Redis URL (without exposing credentials)
const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  const urlParts = redisUrl.split('@');
  const maskedUrl = urlParts.length > 1
    ? `${urlParts[0].substring(0, 20)}...@${urlParts[1]}`
    : 'Redis URL configured';
  console.log('🔍 Redis URL detected:', maskedUrl);
} else {
  console.warn('⚠️  No REDIS_URL environment variable found, using localhost fallback');
}

// Create a single Redis client instance with timeout settings
const redisClient = redis.createClient({
  url: redisUrl || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000, // 60 seconds
    commandTimeout: 5000,  // 5 seconds
    lazyConnect: true,     // Don't connect immediately
  },
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('❌ Redis connection refused, retrying...');
      return Math.min(options.attempt * 100, 3000); // Exponential backoff
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('❌ Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      console.error('❌ Redis retry attempts exhausted');
      return undefined; // Stop retrying
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis connection handling
redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('💡 ECONNREFUSED: Check if Redis URL is correct and Redis service is running');
  }
  if (err.code === 'ETIMEDOUT') {
    console.error('💡 ETIMEDOUT: Network connectivity issue or Redis service is slow');
  }
});

redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('end', () => {
  console.log('ℹ️  Redis client connection ended');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Connect to Redis with error handling
let redisConnected = false;
redisClient.connect().then(() => {
  redisConnected = true;
  console.log('🚀 Redis client connection established successfully');
}).catch((err) => {
  console.error('❌ Failed to connect to Redis:', err.message);
  console.warn('⚠️  Redis functionality will be limited. Check REDIS_URL environment variable.');
  redisConnected = false;
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Closing Redis connection...');
  if (redisConnected) {
    await redisClient.quit();
  }
});

process.on('SIGINT', async () => {
  console.log('🛑 Closing Redis connection...');
  if (redisConnected) {
    await redisClient.quit();
  }
});

module.exports = redisClient;