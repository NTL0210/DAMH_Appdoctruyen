const Chapter = require('../models/Chapter');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

/**
 * Chapter Service
 * 
 * Service for managing chapters with caching.
 * Implements 10-minute TTL cache for chapter lists.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

class ChapterService {
  /**
   * Get chapters by comic ID
   * @param {string} comicId - Comic ID
   * @returns {Promise<Array>} Chapters sorted by chapterIndex ascending
   */
  async getChaptersByComicId(comicId) {
    try {
      // Check cache
      const cacheKey = `chapters:comic:${comicId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('ChapterService: Returning cached chapters', { comicId });
        return JSON.parse(cached);
      }

      // Query database
      const chapters = await Chapter.find({ comicId })
        .sort({ chapterIndex: 1 })
        .lean();

      // Cache for 10 minutes (600 seconds)
      await cacheService.set(cacheKey, JSON.stringify(chapters), 600);

      logger.info('ChapterService: Retrieved chapters from database', { 
        comicId,
        count: chapters.length 
      });

      return chapters;
    } catch (error) {
      logger.error('ChapterService: Error getting chapters by comic ID', {
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get chapter by ID
   * @param {string} chapterId - Chapter ID
   * @returns {Promise<object|null>} Chapter details or null
   */
  async getChapterById(chapterId) {
    try {
      const chapter = await Chapter.findById(chapterId).lean();

      logger.info('ChapterService: Retrieved chapter by ID', { 
        chapterId, 
        found: !!chapter 
      });

      return chapter;
    } catch (error) {
      logger.error('ChapterService: Error getting chapter by ID', {
        chapterId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get chapter pages
   * @param {string} chapterId - Chapter ID
   * @returns {Promise<Array>} Array of page image URLs
   */
  async getChapterPages(chapterId) {
    try {
      const chapter = await this.getChapterById(chapterId);

      if (!chapter) {
        return [];
      }

      const pages = this.parseChapterApiData(chapter.chapterApiData);

      logger.info('ChapterService: Retrieved chapter pages', { 
        chapterId,
        pageCount: pages.length 
      });

      return pages;
    } catch (error) {
      logger.error('ChapterService: Error getting chapter pages', {
        chapterId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Parse chapterApiData to extract page URLs
   * @param {string} chapterApiData - JSON string containing page data
   * @returns {Array} Array of page image URLs
   */
  parseChapterApiData(chapterApiData) {
    try {
      if (!chapterApiData || chapterApiData.trim() === '') {
        return [];
      }

      const data = JSON.parse(chapterApiData);

      // Handle different possible structures
      if (Array.isArray(data)) {
        // If data is already an array of URLs
        return data.filter(url => typeof url === 'string' && url.trim() !== '');
      }

      if (data.pages && Array.isArray(data.pages)) {
        // If data has a pages array
        return data.pages.filter(url => typeof url === 'string' && url.trim() !== '');
      }

      if (data.images && Array.isArray(data.images)) {
        // If data has an images array
        return data.images.filter(url => typeof url === 'string' && url.trim() !== '');
      }

      // If data is an object with page_url or imageUrl properties
      if (typeof data === 'object') {
        const urls = [];
        for (const key in data) {
          if (typeof data[key] === 'string' && data[key].trim() !== '') {
            urls.push(data[key]);
          }
        }
        return urls;
      }

      return [];
    } catch (error) {
      logger.error('ChapterService: Error parsing chapterApiData', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Invalidate chapter cache for a comic
   * @param {string} comicId - Comic ID
   * @returns {Promise<void>}
   */
  async invalidateChapterCache(comicId) {
    try {
      await cacheService.del(`chapters:comic:${comicId}`);
      logger.info('ChapterService: Invalidated chapter cache', { comicId });
    } catch (error) {
      logger.error('ChapterService: Error invalidating chapter cache', {
        comicId,
        error: error.message
      });
    }
  }
}

module.exports = new ChapterService();
