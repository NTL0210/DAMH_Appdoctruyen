const commentService = require('../services/commentService');
const logger = require('../utils/logger');

/**
 * Comment Controller
 * 
 * Handles HTTP requests for comment-related operations.
 * Requires authentication for creating comments.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

/**
 * Create a new comment or reply
 * POST /comments
 * Body: { comicId, content, parentCommentId (optional) }
 * Requires authentication
 */
async function createComment(req, res) {
  try {
    const { comicId, content, parentCommentId } = req.body;

    // Validate required fields
    if (!comicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Content is required'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get user from auth middleware
    const userId = req.user.userId;
    const userName = req.user.username;

    // Create comment
    const comment = await commentService.createComment(
      userId,
      userName,
      comicId,
      content,
      parentCommentId || null
    );

    res.status(201).json({
      success: true,
      data: comment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('CommentController: Error in createComment', {
      body: req.body,
      userId: req.user?.userId,
      error: error.message
    });

    // Handle specific errors
    if (error.message === 'EMPTY_CONTENT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comment content cannot be empty'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.message === 'CONTENT_TOO_LONG') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comment content cannot exceed 1000 characters'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.message === 'PARENT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Parent comment not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create comment'
      },
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Get comments by comic ID
 * GET /comics/:comicId/comments
 */
async function getCommentsByComicId(req, res) {
  try {
    const { comicId } = req.params;

    if (!comicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        },
        timestamp: new Date().toISOString()
      });
    }

    const comments = await commentService.getCommentsByComicId(comicId);

    res.status(200).json({
      success: true,
      data: comments,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('CommentController: Error in getCommentsByComicId', {
      comicId: req.params.comicId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve comments'
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  createComment,
  getCommentsByComicId
};
