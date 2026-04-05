const Comment = require('../models/Comment');
const logger = require('../utils/logger');

/**
 * Comment Service
 * 
 * Service for managing comments with content validation, XSS sanitization,
 * and nested comment tree building.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

class CommentService {
  /**
   * Create a new comment or reply
   * @param {string} userId - User ID
   * @param {string} userName - User name (denormalized)
   * @param {string} comicId - Comic ID
   * @param {string} content - Comment content
   * @param {string|null} parentCommentId - Parent comment ID for replies
   * @returns {Promise<object>} Created comment
   */
  async createComment(userId, userName, comicId, content, parentCommentId = null) {
    try {
      // Validate content
      if (!content || content.trim() === '') {
        throw new Error('EMPTY_CONTENT');
      }

      if (content.length > 1000) {
        throw new Error('CONTENT_TOO_LONG');
      }

      // Sanitize content to prevent XSS
      const sanitizedContent = this.sanitizeContent(content);

      // Verify parent comment exists if provided
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
          throw new Error('PARENT_NOT_FOUND');
        }
      }

      // Create comment
      const comment = new Comment({
        userId,
        userName,
        comicId,
        content: sanitizedContent,
        parentCommentId: parentCommentId || null
      });

      await comment.save();

      logger.info('CommentService: Comment created', {
        commentId: comment._id,
        userId,
        comicId,
        parentCommentId
      });

      return comment.toObject();
    } catch (error) {
      logger.error('CommentService: Error creating comment', {
        userId,
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get comments by comic ID with nested structure
   * @param {string} comicId - Comic ID
   * @returns {Promise<Array>} Array of comments with nested replies
   */
  async getCommentsByComicId(comicId) {
    try {
      // Get all comments for the comic
      const comments = await Comment.find({ comicId })
        .sort({ createdAt: -1 })
        .lean();

      // Build comment tree
      const commentTree = this.buildCommentTree(comments);

      logger.info('CommentService: Retrieved comments', {
        comicId,
        count: comments.length
      });

      return commentTree;
    } catch (error) {
      logger.error('CommentService: Error getting comments', {
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sanitize content to prevent XSS attacks
   * @param {string} content - Raw content
   * @returns {string} Sanitized content
   */
  sanitizeContent(content) {
    if (!content) return '';

    // Remove HTML tags
    let sanitized = content.replace(/<[^>]*>/g, '');

    // Escape special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Build nested comment tree structure
   * @param {Array} comments - Flat array of comments
   * @returns {Array} Nested comment tree
   */
  buildCommentTree(comments) {
    // Create a map for quick lookup
    const commentMap = new Map();
    const rootComments = [];

    // Initialize all comments with empty replies array
    comments.forEach(comment => {
      commentMap.set(comment._id.toString(), {
        ...comment,
        replies: []
      });
    });

    // Build tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment._id.toString());

      if (comment.parentCommentId) {
        // This is a reply, add to parent's replies array
        const parentId = comment.parentCommentId.toString();
        const parent = commentMap.get(parentId);
        
        if (parent) {
          parent.replies.push(commentWithReplies);
        } else {
          // Parent not found, treat as root comment
          rootComments.push(commentWithReplies);
        }
      } else {
        // This is a root comment
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }
}

module.exports = new CommentService();
