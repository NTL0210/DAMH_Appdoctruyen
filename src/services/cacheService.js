const redisConfig = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache Service
 * 
 * Service wrapper for cache operations using Redis with in-memory fallback.
 * Provides a clean interface for caching frequently accessed data.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.7
 */

class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<string|null>} Cached value or null if not found
   */
  async get(key) {
    try {
      return await redisConfig.get(key);
    } catch (error) {
      logger.error('CacheService: Error getting value from cache', {
        key,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300)
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = 300) {
    try {
      await redisConfig.set(key, value, ttl);
    } catch (error) {
      logger.error('CacheService: Error setting value in cache', {
        key,
        ttl,
        error: error.message
      });
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<void>}
   */
  async del(key) {
    try {
      await redisConfig.del(key);
    } catch (error) {
      logger.error('CacheService: Error deleting key from cache', {
        key,
        error: error.message
      });
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern to match keys (e.g., 'comics:*')
   * @returns {Promise<void>}
   */
  async delPattern(pattern) {
    try {
      await redisConfig.delPattern(pattern);
    } catch (error) {
      logger.error('CacheService: Error deleting pattern from cache', {
        pattern,
        error: error.message
      });
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists and not expired
   */
  async exists(key) {
    try {
      return await redisConfig.exists(key);
    } catch (error) {
      logger.error('CacheService: Error checking key existence in cache', {
        key,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get cache status information
   * @returns {object} Cache status (type, connected, memoryCacheSize)
   */
  getCacheStatus() {
    return redisConfig.getCacheStatus();
  }
}

module.exports = new CacheService();
