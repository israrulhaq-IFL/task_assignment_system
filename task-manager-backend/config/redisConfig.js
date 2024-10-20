const Redis = require('ioredis');

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // Replace with your Redis host if different
  port: process.env.REDIS_PORT || 6379,        // Replace with your Redis port if different
  // password: process.env.REDIS_PASSWORD // Uncomment and set if you have a password
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redisClient;