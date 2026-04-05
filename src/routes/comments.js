const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');

/**
 * Comment Routes
 * 
 * Defines routes for comment-related operations.
 * POST route requires authentication.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

/**
 * POST /comments
 * Create a new comment or reply
 * Body: { comicId, content, parentCommentId (optional) }
 * Requires authentication
 */
router.post('/', authMiddleware, commentController.createComment);

/**
 * GET /comics/:comicId/comments
 * Get comments by comic ID with nested structure
 * Params: comicId (required)
 * Public route (no authentication required)
 */
router.get('/comics/:comicId/comments', commentController.getCommentsByComicId);

module.exports = router;
