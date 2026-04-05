const readingProgressService = require('../services/readingProgressService');
const logger = require('../utils/logger');

/**
 * Reading Progress Controller
 * 
 * Handles HTTP requests for reading progress operations.
 * All operations require authentication.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * Update reading progress
 * POST /reading-progress
 * Body: { comicId, chapterId, chapterIndex }
 */
async function updateProgress(req, res) {
  try {
    const { comicId, chapterId, chapterIndex } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!comicId || !chapterId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'comicId and chapterId are required'
        }
      });
    }

    const progress = await readingProgressService.updateProgress(
      userId,
      comicId,
      chapterId,
      chapterIndex || 0
    );

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('ReadingProgressController: Error in updateProgress', {
      userId: req.user?.userId,
      body: req.body,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update reading progress'
      }
    });
  }
}

/**
 * Get reading progress for a specific comic
 * GET /reading-progress/:comicId
 */
async function getProgress(req, res) {
  try {
    const { comicId } = req.params;
    const userId = req.user.userId;

    if (!comicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'comicId is required'
        }
      });
    }

    const progress = await readingProgressService.getProgress(userId, comicId);

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No reading progress found for this comic'
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('ReadingProgressController: Error in getProgress', {
      userId: req.user?.userId,
      comicId: req.params.comicId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve reading progress'
      }
    });
  }
}

/**
 * Get all reading progress for the authenticated user
 * GET /reading-progress
 */
async function getProgressList(req, res) {
  try {
    const userId = req.user.userId;

    const progressList = await readingProgressService.getProgressList(userId);

    res.status(200).json({
      success: true,
      data: progressList
    });
  } catch (error) {
    logger.error('ReadingProgressController: Error in getProgressList', {
      userId: req.user?.userId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve reading progress list'
      }
    });
  }
}

module.exports = {
  updateProgress,
  getProgress,
  getProgressList
};
