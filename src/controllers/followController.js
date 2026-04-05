const followService = require('../services/followService');
const logger = require('../utils/logger');

/**
 * Follow Controller
 * 
 * Handles HTTP requests for follow-related operations.
 * All operations require authentication.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

/**
 * Follow a comic
 * POST /follows
 * Body: { comicId: string }
 * Requires authentication
 */
async function followComic(req, res) {
  try {
    const { comicId } = req.body;
    const userId = req.user.userId;

    if (!comicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        }
      });
    }

    const follow = await followService.followComic(userId, comicId);

    res.status(201).json({
      success: true,
      data: {
        accountId: follow.accountId,
        comicId: follow.comicId,
        createdAt: follow.createdAt
      }
    });
  } catch (error) {
    logger.error('FollowController: Error in followComic', {
      userId: req.user?.userId,
      body: req.body,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to follow comic'
      }
    });
  }
}

/**
 * Unfollow a comic
 * DELETE /follows/:comicId
 * Requires authentication
 */
async function unfollowComic(req, res) {
  try {
    const { comicId } = req.params;
    const userId = req.user.userId;

    if (!comicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        }
      });
    }

    const unfollowed = await followService.unfollowComic(userId, comicId);

    if (!unfollowed) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Follow record not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed comic'
    });
  } catch (error) {
    logger.error('FollowController: Error in unfollowComic', {
      userId: req.user?.userId,
      comicId: req.params.comicId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to unfollow comic'
      }
    });
  }
}

/**
 * Get user's followed comics
 * GET /follows
 * Requires authentication
 */
async function getFollowedComics(req, res) {
  try {
    const userId = req.user.userId;

    const followedComics = await followService.getFollowedComics(userId);

    res.status(200).json({
      success: true,
      data: followedComics
    });
  } catch (error) {
    logger.error('FollowController: Error in getFollowedComics', {
      userId: req.user?.userId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve followed comics'
      }
    });
  }
}

module.exports = {
  followComic,
  unfollowComic,
  getFollowedComics
};
