const Comic = require('../models/Comic');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

/**
 * Comic Service
 * 
 * Service for managing comics with pagination, search, and caching.
 * Implements 5-minute TTL cache for comic lists and search results.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

class ComicService {
  /**
   * Get comics with pagination
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page (default: 20)
   * @param {string} genreId - Optional genre filter
   * @returns {Promise<object>} Paginated comics with metadata
   */
  async getComics(page = 1, limit = 20, genreId = null) {
    try {
      // Ensure page is at least 1
      page = Math.max(1, parseInt(page));
      limit = Math.min(20, Math.max(1, parseInt(limit)));

      // Build cache key
      const cacheKey = `comics:list:page:${page}:limit:${limit}:genre:${genreId || 'all'}`;
      
      // Check cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('ComicService: Returning cached comics list', { page, limit, genreId });
        return JSON.parse(cached);
      }

      // Build query
      const query = {};
      if (genreId) {
        query['comicGenres.genreId'] = genreId;
      }

      // Calculate skip
      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [comics, totalElements] = await Promise.all([
        Comic.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Comic.countDocuments(query)
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalElements / limit);

      const result = {
        data: comics,
        pagination: {
          pageNumber: page,
          pageSize: limit,
          totalPages,
          totalElements
        }
      };

      // Cache for 5 minutes (300 seconds)
      await cacheService.set(cacheKey, JSON.stringify(result), 300);

      logger.info('ComicService: Retrieved comics from database', { 
        page, 
        limit, 
        genreId,
        count: comics.length 
      });

      return result;
    } catch (error) {
      logger.error('ComicService: Error getting comics', {
        page,
        limit,
        genreId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get comic by ID
   * @param {string} comicId - Comic ID
   * @returns {Promise<object|null>} Comic details or null
   */
  async getComicById(comicId) {
    try {
      // Check cache
      const cacheKey = `comic:id:${comicId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('ComicService: Returning cached comic by ID', { comicId });
        return JSON.parse(cached);
      }

      const comic = await Comic.findOne({ comicId }).lean();

      if (comic) {
        // Cache for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(comic), 300);
      }

      logger.info('ComicService: Retrieved comic by ID', { comicId, found: !!comic });
      return comic;
    } catch (error) {
      logger.error('ComicService: Error getting comic by ID', {
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get comic by slug
   * @param {string} slug - Comic slug
   * @returns {Promise<object|null>} Comic details or null
   */
  async getComicBySlug(slug) {
    try {
      // Check cache
      const cacheKey = `comic:slug:${slug}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('ComicService: Returning cached comic by slug', { slug });
        return JSON.parse(cached);
      }

      const comic = await Comic.findOne({ slug }).lean();

      if (comic) {
        // Cache for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(comic), 300);
      }

      logger.info('ComicService: Retrieved comic by slug', { slug, found: !!comic });
      return comic;
    } catch (error) {
      logger.error('ComicService: Error getting comic by slug', {
        slug,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Search comics by name or originName
   * @param {string} keyword - Search keyword
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<object>} Paginated search results
   */
  async searchComics(keyword, page = 1, limit = 20) {
    try {
      if (!keyword || keyword.trim() === '') {
        return {
          data: [],
          pagination: {
            pageNumber: page,
            pageSize: limit,
            totalPages: 0,
            totalElements: 0
          }
        };
      }

      // Ensure page is at least 1
      page = Math.max(1, parseInt(page));
      limit = Math.min(20, Math.max(1, parseInt(limit)));

      // Build cache key
      const cacheKey = `comics:search:${keyword}:page:${page}:limit:${limit}`;
      
      // Check cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('ComicService: Returning cached search results', { keyword, page, limit });
        return JSON.parse(cached);
      }

      // Use text search index
      const skip = (page - 1) * limit;

      const [comics, totalElements] = await Promise.all([
        Comic.find({ $text: { $search: keyword } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit)
          .lean(),
        Comic.countDocuments({ $text: { $search: keyword } })
      ]);

      const totalPages = Math.ceil(totalElements / limit);

      const result = {
        data: comics,
        pagination: {
          pageNumber: page,
          pageSize: limit,
          totalPages,
          totalElements
        }
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, JSON.stringify(result), 300);

      logger.info('ComicService: Search completed', { 
        keyword, 
        page, 
        limit,
        count: comics.length 
      });

      return result;
    } catch (error) {
      logger.error('ComicService: Error searching comics', {
        keyword,
        page,
        limit,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get comics by genre with pagination
   * @param {string} genreId - Genre ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<object>} Paginated comics
   */
  async getComicsByGenre(genreId, page = 1, limit = 20) {
    return this.getComics(page, limit, genreId);
  }

  /**
   * Invalidate comic cache
   * @param {string} comicId - Comic ID to invalidate
   * @returns {Promise<void>}
   */
  async invalidateComicCache(comicId) {
    try {
      // Delete specific comic caches
      await cacheService.del(`comic:id:${comicId}`);
      
      // Get comic to find slug
      const comic = await Comic.findOne({ comicId }).lean();
      if (comic) {
        await cacheService.del(`comic:slug:${comic.slug}`);
      }

      // Invalidate list caches (all pages and genre filters)
      await cacheService.delPattern('comics:list:*');
      await cacheService.delPattern('comics:search:*');

      logger.info('ComicService: Invalidated comic cache', { comicId });
    } catch (error) {
      logger.error('ComicService: Error invalidating comic cache', {
        comicId,
        error: error.message
      });
    }
  }
}

module.exports = new ComicService();
