const chapterService = require('../services/chapterService');
const logger = require('../utils/logger');

/**
 * Chapter Controller
 * 
 * Handles HTTP requests for chapter-related operations.
 * Returns appropriate status codes and error messages.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

/**
 * Get chapters by comic ID
 * GET /comics/:comicId/chapters
 */
async function getChaptersByComicId(req, res) {
  try {
    const { comicId } = req.params;

    if (!comicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        }
      });
    }

    const chapters = await chapterService.getChaptersByComicId(comicId);

    res.status(200).json({
      success: true,
      data: chapters
    });
  } catch (error) {
    logger.error('ChapterController: Error in getChaptersByComicId', {
      comicId: req.params.comicId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve chapters'
      }
    });
  }
}

/**
 * Get chapter by ID
 * GET /chapters/:id
 */
async function getChapterById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Chapter ID is required'
        }
      });
    }

    const chapter = await chapterService.getChapterById(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chapter not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    logger.error('ChapterController: Error in getChapterById', {
      id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve chapter'
      }
    });
  }
}

/**
 * Get chapter pages
 * GET /chapters/:id/pages
 */
async function getChapterPages(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Chapter ID is required'
        }
      });
    }

    const pages = await chapterService.getChapterPages(id);

    // Check if chapter exists (empty array could mean no pages or no chapter)
    const chapter = await chapterService.getChapterById(id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chapter not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: pages
    });
  } catch (error) {
    logger.error('ChapterController: Error in getChapterPages', {
      id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve chapter pages'
      }
    });
  }
}

module.exports = {
  getChaptersByComicId,
  getChapterById,
  getChapterPages
};
