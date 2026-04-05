const redis = require('redis');
const logger = require('../utils/logger');

/**
 * Redis cache configuration with in-memory fallback
 * Implements graceful degradation when Redis is unavailable
 */

let redisClient = null;
let isRedisAvailable = false;
const memoryCache = new Map();

/**
 * Initialize Redis client with error handling
 * Falls back to in-memory cache if Redis is unavailable
 * @returns {Promise<void>}
 */
const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('REDIS_URL environment variable not defined, using in-memory cache fallback');
    isRedisAvailable = false;
    return;
  }

  try {
    logger.info('Attempting to connect to Redis');

    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.error('Redis reconnection failed after 3 attempts, switching to in-memory cache');
            isRedisAvailable = false;
            return false; // Stop reconnecting
          }
          const delay = Math.min(retries * 1000, 3000);
          logger.info(`Retrying Redis connection in ${delay}ms (attempt ${retries})`);
          return delay;
        }
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
      isRedisAvailable = true;
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
      isRedisAvailable = true;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection closed');
      isRedisAvailable = false;
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
    isRedisAvailable = true;

  } catch (error) {
    logger.error('Failed to connect to Redis, using in-memory cache fallback', {
      error: error.message
    });
    isRedisAvailable = false;
    redisClient = null;
  }
};

/**
 * Get value from cache (Redis or in-memory fallback)
 * @param {string} key - Cache key
 * @returns {Promise<string|null>} Cached value or null if not found
 */
const get = async (key) => {
  try {
    if (isRedisAvailable && redisClient) {
      return await redisClient.get(key);
    } else {
      const cached = memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      } else if (cached) {
        memoryCache.delete(key);
      }
      return null;
    }
  } catch (error) {
    logger.error('Cache get error, falling back to in-memory', {
      key,
      error: error.message
    });
    isRedisAvailable = false;
    const cached = memoryCache.get(key);
    return (cached && cached.expiresAt > Date.now()) ? cached.value : null;
  }
};

/**
 * Set value in cache with TTL (Redis or in-memory fallback)
 * @param {string} key - Cache key
 * @param {string} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
const set = async (key, value, ttl = 300) => {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.setEx(key, ttl, value);
    } else {
      memoryCache.set(key, {
        value,
        expiresAt: Date.now() + (ttl * 1000)
      });
    }
  } catch (error) {
    logger.error('Cache set error, falling back to in-memory', {
      key,
      error: error.message
    });
    isRedisAvailable = false;
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000)
    });
  }
};

/**
 * Delete key from cache (Redis or in-memory fallback)
 * @param {string} key - Cache key to delete
 * @returns {Promise<void>}
 */
const del = async (key) => {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    logger.error('Cache delete error, falling back to in-memory', {
      key,
      error: error.message
    });
    isRedisAvailable = false;
    memoryCache.delete(key);
  }
};

/**
 * Delete keys matching pattern (Redis or in-memory fallback)
 * @param {string} pattern - Pattern to match keys (e.g., 'comics:*')
 * @returns {Promise<void>}
 */
const delPattern = async (pattern) => {
  try {
    if (isRedisAvailable && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Convert Redis pattern to regex
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    logger.error('Cache delete pattern error', {
      pattern,
      error: error.message
    });
    isRedisAvailable = false;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  }
};

/**
 * Check if key exists in cache (Redis or in-memory fallback)
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if key exists and not expired
 */
const exists = async (key) => {
  try {
    if (isRedisAvailable && redisClient) {
      return await redisClient.exists(key) === 1;
    } else {
      const cached = memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return true;
      } else if (cached) {
        memoryCache.delete(key);
      }
      return false;
    }
  } catch (error) {
    logger.error('Cache exists error, falling back to in-memory', {
      key,
      error: error.message
    });
    isRedisAvailable = false;
    const cached = memoryCache.get(key);
    return cached && cached.expiresAt > Date.now();
  }
};

/**
 * Disconnect from Redis
 * @returns {Promise<void>}
 */
const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from Redis', { error: error.message });
    }
  }
  memoryCache.clear();
};

/**
 * Get cache status
 * @returns {object} Cache status information
 */
const getCacheStatus = () => {
  return {
    type: isRedisAvailable ? 'redis' : 'memory',
    connected: isRedisAvailable,
    memoryCacheSize: memoryCache.size
  };
};

module.exports = {
  connectRedis,
  disconnectRedis,
  get,
  set,
  del,
  delPattern,
  exists,
  getCacheStatus
};
