const comicService = require('../services/comicService');
const logger = require('../utils/logger');

/**
 * Comic Controller
 * 
 * Handles HTTP requests for comic-related operations.
 * Returns appropriate status codes and error messages.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

/**
 * Get comics with pagination and optional genre filter
 * GET /comics?page=1&limit=20&genreId=xxx
 */
async function getComics(req, res) {
  try {
    const { page = 1, limit = 20, genreId } = req.query;

    const result = await comicService.getComics(page, limit, genreId);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('ComicController: Error in getComics', {
      query: req.query,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve comics'
      }
    });
  }
}

/**
 * Get comic by ID
 * GET /comics/:id
 */
async function getComicById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        }
      });
    }

    const comic = await comicService.getComicById(id);

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Comic not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: comic
    });
  } catch (error) {
    logger.error('ComicController: Error in getComicById', {
      id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve comic'
      }
    });
  }
}

/**
 * Get comic by slug
 * GET /comics/slug/:slug
 */
async function getComicBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic slug is required'
        }
      });
    }

    const comic = await comicService.getComicBySlug(slug);

    if (!comic) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Comic not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: comic
    });
  } catch (error) {
    logger.error('ComicController: Error in getComicBySlug', {
      slug: req.params.slug,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve comic'
      }
    });
  }
}

/**
 * Search comics by keyword
 * GET /comics/search?keyword=xxx&page=1&limit=20
 */
async function searchComics(req, res) {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Search keyword is required'
        }
      });
    }

    const result = await comicService.searchComics(keyword, page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('ComicController: Error in searchComics', {
      query: req.query,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search comics'
      }
    });
  }
}

module.exports = {
  getComics,
  getComicById,
  getComicBySlug,
  searchComics
};
