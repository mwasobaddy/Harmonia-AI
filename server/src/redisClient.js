// Shared Redis client for the entire application
const redis = require('redis');

// Create a single Redis client instance
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Redis connection handling
redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err);
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

// Connect to Redis
redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Closing Redis connection...');
  await redisClient.quit();
});

process.on('SIGINT', async () => {
  console.log('🛑 Closing Redis connection...');
  await redisClient.quit();
});

module.exports = redisClient;