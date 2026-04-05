const redis = require('redis');
const redisConfig = require('../../../src/config/redis');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('redis');
jest.mock('../../../src/utils/logger');

describe('Redis Configuration', () => {
  let mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment
    process.env.REDIS_URL = 'redis://localhost:6379';

    // Create mock Redis client
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      on: jest.fn()
    };

    redis.createClient.mockReturnValue(mockRedisClient);
  });

  afterEach(() => {
    delete process.env.REDIS_URL;
  });

  describe('connectRedis', () => {
    it('should connect to Redis successfully when REDIS_URL is provided', async () => {
      await redisConfig.connectRedis();

      expect(redis.createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'redis://localhost:6379'
        })
      );
      expect(mockRedisClient.connect).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Redis connected successfully');
    });

    it('should use in-memory cache when REDIS_URL is not defined', async () => {
      delete process.env.REDIS_URL;

      await redisConfig.connectRedis();

      expect(redis.createClient).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'REDIS_URL environment variable not defined, using in-memory cache fallback'
      );
    });

    it('should fallback to in-memory cache when Redis connection fails', async () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection refused'));

      await redisConfig.connectRedis();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to connect to Redis, using in-memory cache fallback',
        expect.objectContaining({
          error: 'Connection refused'
        })
      );
    });

    it('should register event handlers for Redis client', async () => {
      await redisConfig.connectRedis();

      expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('end', expect.any(Function));
    });
  });

  describe('get', () => {
    it('should get value from Redis when available', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.get.mockResolvedValue('cached-value');

      const result = await redisConfig.get('test-key');

      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('cached-value');
    });

    it('should return null when key does not exist in Redis', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.get.mockResolvedValue(null);

      const result = await redisConfig.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should use in-memory cache when Redis is unavailable', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      // Set value in memory cache
      await redisConfig.set('test-key', 'memory-value', 300);

      const result = await redisConfig.get('test-key');

      expect(result).toBe('memory-value');
    });

    it('should return null for expired in-memory cache entries', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      // Set value with 0 TTL (already expired)
      await redisConfig.set('test-key', 'expired-value', 0);

      // Wait a bit to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await redisConfig.get('test-key');

      expect(result).toBeNull();
    });

    it('should fallback to in-memory cache when Redis get fails', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      // Set value in memory cache as fallback
      await redisConfig.set('test-key', 'fallback-value', 300);

      const result = await redisConfig.get('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        'Cache get error, falling back to in-memory',
        expect.any(Object)
      );
      expect(result).toBe('fallback-value');
    });
  });

  describe('set', () => {
    it('should set value in Redis with TTL', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.setEx.mockResolvedValue('OK');

      await redisConfig.set('test-key', 'test-value', 600);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith('test-key', 600, 'test-value');
    });

    it('should use default TTL of 300 seconds when not specified', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.setEx.mockResolvedValue('OK');

      await redisConfig.set('test-key', 'test-value');

      expect(mockRedisClient.setEx).toHaveBeenCalledWith('test-key', 300, 'test-value');
    });

    it('should set value in memory cache when Redis is unavailable', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('test-key', 'memory-value', 300);

      const result = await redisConfig.get('test-key');
      expect(result).toBe('memory-value');
    });

    it('should fallback to in-memory cache when Redis set fails', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.setEx.mockRejectedValue(new Error('Redis error'));

      await redisConfig.set('test-key', 'fallback-value', 300);

      expect(logger.error).toHaveBeenCalledWith(
        'Cache set error, falling back to in-memory',
        expect.any(Object)
      );

      // Verify value is in memory cache
      const result = await redisConfig.get('test-key');
      expect(result).toBe('fallback-value');
    });
  });

  describe('del', () => {
    it('should delete key from Redis', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.del.mockResolvedValue(1);

      await redisConfig.del('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });

    it('should delete key from memory cache when Redis is unavailable', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('test-key', 'test-value', 300);
      await redisConfig.del('test-key');

      const result = await redisConfig.get('test-key');
      expect(result).toBeNull();
    });

    it('should fallback to in-memory cache when Redis delete fails', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.del.mockRejectedValue(new Error('Redis error'));

      await redisConfig.del('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        'Cache delete error, falling back to in-memory',
        expect.any(Object)
      );
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern in Redis', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.keys.mockResolvedValue(['comics:1', 'comics:2', 'comics:3']);
      mockRedisClient.del.mockResolvedValue(3);

      await redisConfig.delPattern('comics:*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('comics:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(['comics:1', 'comics:2', 'comics:3']);
    });

    it('should not call del when no keys match pattern', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.keys.mockResolvedValue([]);

      await redisConfig.delPattern('nonexistent:*');

      expect(mockRedisClient.keys).toHaveBeenCalledWith('nonexistent:*');
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should delete keys matching pattern in memory cache', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('comics:1', 'value1', 300);
      await redisConfig.set('comics:2', 'value2', 300);
      await redisConfig.set('users:1', 'value3', 300);

      await redisConfig.delPattern('comics:*');

      expect(await redisConfig.get('comics:1')).toBeNull();
      expect(await redisConfig.get('comics:2')).toBeNull();
      expect(await redisConfig.get('users:1')).toBe('value3');
    });

    it('should fallback to in-memory cache when Redis pattern delete fails', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'));

      await redisConfig.delPattern('comics:*');

      expect(logger.error).toHaveBeenCalledWith(
        'Cache delete pattern error',
        expect.any(Object)
      );
    });
  });

  describe('exists', () => {
    it('should check if key exists in Redis', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await redisConfig.exists('test-key');

      expect(mockRedisClient.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist in Redis', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await redisConfig.exists('non-existent-key');

      expect(result).toBe(false);
    });

    it('should check if key exists in memory cache', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('test-key', 'test-value', 300);

      const result = await redisConfig.exists('test-key');
      expect(result).toBe(true);
    });

    it('should return false for expired keys in memory cache', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('test-key', 'test-value', 0);
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await redisConfig.exists('test-key');
      expect(result).toBe(false);
    });

    it('should fallback to in-memory cache when Redis exists fails', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.exists.mockRejectedValue(new Error('Redis error'));

      const result = await redisConfig.exists('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        'Cache exists error, falling back to in-memory',
        expect.any(Object)
      );
      expect(result).toBe(false);
    });
  });

  describe('disconnectRedis', () => {
    it('should disconnect from Redis successfully', async () => {
      await redisConfig.connectRedis();

      await redisConfig.disconnectRedis();

      expect(mockRedisClient.quit).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Redis disconnected successfully');
    });

    it('should handle disconnect errors gracefully', async () => {
      await redisConfig.connectRedis();
      mockRedisClient.quit.mockRejectedValue(new Error('Disconnect error'));

      await redisConfig.disconnectRedis();

      expect(logger.error).toHaveBeenCalledWith(
        'Error disconnecting from Redis',
        expect.objectContaining({
          error: 'Disconnect error'
        })
      );
    });

    it('should clear memory cache on disconnect', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('test-key', 'test-value', 300);
      await redisConfig.disconnectRedis();

      const result = await redisConfig.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('getCacheStatus', () => {
    it('should return Redis status when connected', async () => {
      await redisConfig.connectRedis();

      const status = redisConfig.getCacheStatus();

      expect(status).toEqual({
        type: 'redis',
        connected: true,
        memoryCacheSize: 0
      });
    });

    it('should return memory cache status when Redis is unavailable', async () => {
      delete process.env.REDIS_URL;
      await redisConfig.connectRedis();

      await redisConfig.set('key1', 'value1', 300);
      await redisConfig.set('key2', 'value2', 300);

      const status = redisConfig.getCacheStatus();

      expect(status).toEqual({
        type: 'memory',
        connected: false,
        memoryCacheSize: 2
      });
    });
  });
});
