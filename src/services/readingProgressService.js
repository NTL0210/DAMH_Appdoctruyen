const ReadingProgress = require('../models/ReadingProgress');
const logger = require('../utils/logger');

/**
 * Reading Progress Service
 * 
 * Service for tracking user reading progress across comics.
 * Implements upsert logic to update existing progress records.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

class ReadingProgressService {
  /**
   * Update reading progress for a user
   * Uses upsert to update existing record or create new one
   * @param {string} userId - User ID (accountId)
   * @param {string} comicId - Comic ID
   * @param {string} chapterId - Chapter ID
   * @param {number} chapterIndex - Chapter index (optional)
   * @returns {Promise<object>} Updated progress record
   */
  async updateProgress(userId, comicId, chapterId, chapterIndex = 0) {
    try {
      // Find existing progress
      const existingProgress = await ReadingProgress.findOne({
        accountId: userId,
        comicId
      });

      if (existingProgress) {
        // Update existing record
        existingProgress.chapterId = chapterId;
        existingProgress.chapterIndex = chapterIndex;
        existingProgress.lastReadAt = new Date();

        // Add to completedChapters if not already present
        if (!existingProgress.completedChapters.includes(chapterId)) {
          existingProgress.completedChapters.push(chapterId);
        }

        await existingProgress.save();

        logger.info('ReadingProgressService: Updated existing progress', {
          userId,
          comicId,
          chapterId
        });

        return existingProgress.toObject();
      } else {
        // Create new progress record
        const newProgress = await ReadingProgress.create({
          accountId: userId,
          comicId,
          chapterId,
          chapterIndex,
          lastReadAt: new Date(),
          completedChapters: [chapterId]
        });

        logger.info('ReadingProgressService: Created new progress', {
          userId,
          comicId,
          chapterId
        });

        return newProgress.toObject();
      }
    } catch (error) {
      logger.error('ReadingProgressService: Error updating progress', {
        userId,
        comicId,
        chapterId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get reading progress for a specific comic
   * @param {string} userId - User ID (accountId)
   * @param {string} comicId - Comic ID
   * @returns {Promise<object|null>} Progress record or null
   */
  async getProgress(userId, comicId) {
    try {
      const progress = await ReadingProgress.findOne({
        accountId: userId,
        comicId
      }).lean();

      logger.info('ReadingProgressService: Retrieved progress', {
        userId,
        comicId,
        found: !!progress
      });

      return progress;
    } catch (error) {
      logger.error('ReadingProgressService: Error getting progress', {
        userId,
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get all reading progress for a user
   * @param {string} userId - User ID (accountId)
   * @returns {Promise<Array>} Array of progress records
   */
  async getProgressList(userId) {
    try {
      const progressList = await ReadingProgress.find({
        accountId: userId
      })
        .sort({ lastReadAt: -1 })
        .lean();

      logger.info('ReadingProgressService: Retrieved progress list', {
        userId,
        count: progressList.length
      });

      return progressList;
    } catch (error) {
      logger.error('ReadingProgressService: Error getting progress list', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get completed chapters for a comic
   * @param {string} userId - User ID (accountId)
   * @param {string} comicId - Comic ID
   * @returns {Promise<Array>} Array of completed chapter IDs
   */
  async getCompletedChapters(userId, comicId) {
    try {
      const progress = await ReadingProgress.findOne({
        accountId: userId,
        comicId
      }).lean();

      const completedChapters = progress ? progress.completedChapters : [];

      logger.info('ReadingProgressService: Retrieved completed chapters', {
        userId,
        comicId,
        count: completedChapters.length
      });

      return completedChapters;
    } catch (error) {
      logger.error('ReadingProgressService: Error getting completed chapters', {
        userId,
        comicId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ReadingProgressService();
