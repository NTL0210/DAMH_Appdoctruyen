const cacheService = require('../../../src/services/cacheService');
const redisConfig = require('../../../src/config/redis');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/config/redis');
jest.mock('../../../src/utils/logger');

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get value from cache successfully', async () => {
      redisConfig.get.mockResolvedValue('cached-value');

      const result = await cacheService.get('test-key');

      expect(redisConfig.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('cached-value');
    });

    it('should return null when key does not exist', async () => {
      redisConfig.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      redisConfig.get.mockRejectedValue(new Error('Cache error'));

      const result = await cacheService.get('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        'CacheService: Error getting value from cache',
        expect.objectContaining({
          key: 'test-key',
          error: 'Cache error'
        })
      );
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in cache with default TTL', async () => {
      redisConfig.set.mockResolvedValue(undefined);

      await cacheService.set('test-key', 'test-value');

      expect(redisConfig.set).toHaveBeenCalledWith('test-key', 'test-value', 300);
    });

    it('should set value in cache with custom TTL', async () => {
      redisConfig.set.mockResolvedValue(undefined);

      await cacheService.set('test-key', 'test-value', 600);

      expect(redisConfig.set).toHaveBeenCalledWith('test-key', 'test-value', 600);
    });

    it('should handle errors gracefully', async () => {
      redisConfig.set.mockRejectedValue(new Error('Cache error'));

      await cacheService.set('test-key', 'test-value', 300);

      expect(logger.error).toHaveBeenCalledWith(
        'CacheService: Error setting value in cache',
        expect.objectContaining({
          key: 'test-key',
          ttl: 300,
          error: 'Cache error'
        })
      );
    });
  });

  describe('del', () => {
    it('should delete key from cache successfully', async () => {
      redisConfig.del.mockResolvedValue(undefined);

      await cacheService.del('test-key');

      expect(redisConfig.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle errors gracefully', async () => {
      redisConfig.del.mockRejectedValue(new Error('Cache error'));

      await cacheService.del('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        'CacheService: Error deleting key from cache',
        expect.objectContaining({
          key: 'test-key',
          error: 'Cache error'
        })
      );
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern successfully', async () => {
      redisConfig.delPattern.mockResolvedValue(undefined);

      await cacheService.delPattern('comics:*');

      expect(redisConfig.delPattern).toHaveBeenCalledWith('comics:*');
    });

    it('should handle errors gracefully', async () => {
      redisConfig.delPattern.mockRejectedValue(new Error('Cache error'));

      await cacheService.delPattern('comics:*');

      expect(logger.error).toHaveBeenCalledWith(
        'CacheService: Error deleting pattern from cache',
        expect.objectContaining({
          pattern: 'comics:*',
          error: 'Cache error'
        })
      );
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      redisConfig.exists.mockResolvedValue(true);

      const result = await cacheService.exists('test-key');

      expect(redisConfig.exists).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      redisConfig.exists.mockResolvedValue(false);

      const result = await cacheService.exists('non-existent-key');

      expect(result).toBe(false);
    });

    it('should handle errors gracefully and return false', async () => {
      redisConfig.exists.mockRejectedValue(new Error('Cache error'));

      const result = await cacheService.exists('test-key');

      expect(logger.error).toHaveBeenCalledWith(
        'CacheService: Error checking key existence in cache',
        expect.objectContaining({
          key: 'test-key',
          error: 'Cache error'
        })
      );
      expect(result).toBe(false);
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status from redis config', () => {
      const mockStatus = {
        type: 'redis',
        connected: true,
        memoryCacheSize: 0
      };
      redisConfig.getCacheStatus.mockReturnValue(mockStatus);

      const result = cacheService.getCacheStatus();

      expect(redisConfig.getCacheStatus).toHaveBeenCalled();
      expect(result).toEqual(mockStatus);
    });

    it('should return memory cache status when Redis unavailable', () => {
      const mockStatus = {
        type: 'memory',
        connected: false,
        memoryCacheSize: 5
      };
      redisConfig.getCacheStatus.mockReturnValue(mockStatus);

      const result = cacheService.getCacheStatus();

      expect(result).toEqual(mockStatus);
    });
  });
});
