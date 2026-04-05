const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/auth');

/**
 * Follow Routes
 * 
 * Defines routes for follow-related operations.
 * All routes require authentication.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

/**
 * POST /follows
 * Follow a comic
 * Body: { comicId: string }
 * Requires authentication
 */
router.post('/', authMiddleware, followController.followComic);

/**
 * DELETE /follows/:comicId
 * Unfollow a comic
 * Params: comicId (required)
 * Requires authentication
 */
router.delete('/:comicId', authMiddleware, followController.unfollowComic);

/**
 * GET /follows
 * Get user's followed comics
 * Requires authentication
 */
router.get('/', authMiddleware, followController.getFollowedComics);

module.exports = router;
