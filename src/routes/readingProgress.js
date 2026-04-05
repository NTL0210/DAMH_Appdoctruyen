const express = require('express');
const router = express.Router();
const readingProgressController = require('../controllers/readingProgressController');
const authMiddleware = require('../middleware/auth');

/**
 * Reading Progress Routes
 * 
 * Defines routes for reading progress tracking operations.
 * All routes require authentication.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * POST /reading-progress
 * Update reading progress
 * Body: { comicId, chapterId, chapterIndex }
 * Requires authentication
 */
router.post('/', authMiddleware, readingProgressController.updateProgress);

/**
 * GET /reading-progress/:comicId
 * Get reading progress for a specific comic
 * Params: comicId (required)
 * Requires authentication
 */
router.get('/:comicId', authMiddleware, readingProgressController.getProgress);

/**
 * GET /reading-progress
 * Get all reading progress for the authenticated user
 * Requires authentication
 */
router.get('/', authMiddleware, readingProgressController.getProgressList);

module.exports = router;
