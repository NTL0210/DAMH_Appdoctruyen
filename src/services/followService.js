const Follow = require('../models/Follow');
const Comic = require('../models/Comic');
const logger = require('../utils/logger');

/**
 * Follow Service
 * 
 * Service for managing comic follows/unfollows.
 * Implements duplicate follow prevention and follower tracking.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

class FollowService {
  /**
   * Follow a comic
   * @param {string} userId - User ID (accountId)
   * @param {string} comicId - Comic ID
   * @returns {Promise<object>} Created follow record
   */
  async followComic(userId, comicId) {
    try {
      // Check if already following (duplicate prevention)
      const existingFollow = await Follow.findOne({
        accountId: userId,
        comicId: comicId
      });

      if (existingFollow) {
        logger.info('FollowService: User already following comic', { userId, comicId });
        return existingFollow;
      }

      // Create new follow record
      const follow = new Follow({
        accountId: userId,
        comicId: comicId
      });

      await follow.save();

      logger.info('FollowService: User followed comic', { userId, comicId });
      return follow;
    } catch (error) {
      logger.error('FollowService: Error following comic', {
        userId,
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Unfollow a comic
   * @param {string} userId - User ID (accountId)
   * @param {string} comicId - Comic ID
   * @returns {Promise<boolean>} True if unfollowed, false if not following
   */
  async unfollowComic(userId, comicId) {
    try {
      const result = await Follow.deleteOne({
        accountId: userId,
        comicId: comicId
      });

      const unfollowed = result.deletedCount > 0;

      logger.info('FollowService: Unfollow attempt', { 
        userId, 
        comicId, 
        unfollowed 
      });

      return unfollowed;
    } catch (error) {
      logger.error('FollowService: Error unfollowing comic', {
        userId,
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user's followed comics
   * @param {string} userId - User ID (accountId)
   * @returns {Promise<Array>} Array of followed comics with summary data
   */
  async getFollowedComics(userId) {
    try {
      // Get all follows for user
      const follows = await Follow.find({ accountId: userId })
        .sort({ createdAt: -1 })
        .lean();

      // Extract comic IDs
      const comicIds = follows.map(f => f.comicId);

      if (comicIds.length === 0) {
        return [];
      }

      // Fetch comic summary data
      const comics = await Comic.find({ comicId: { $in: comicIds } })
        .select('comicId name slug thumbUrl updatedAt')
        .lean();

      // Create a map for quick lookup
      const comicMap = new Map(comics.map(c => [c.comicId, c]));

      // Combine follow data with comic data, maintaining follow order
      const result = follows.map(follow => {
        const comic = comicMap.get(follow.comicId);
        return {
          comicId: follow.comicId,
          followedAt: follow.createdAt,
          ...(comic && {
            name: comic.name,
            slug: comic.slug,
            thumbUrl: comic.thumbUrl,
            updatedAt: comic.updatedAt
          })
        };
      });

      logger.info('FollowService: Retrieved followed comics', { 
        userId, 
        count: result.length 
      });

      return result;
    } catch (error) {
      logger.error('FollowService: Error getting followed comics', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check if user is following a comic
   * @param {string} userId - User ID (accountId)
   * @param {string} comicId - Comic ID
   * @returns {Promise<boolean>} True if following, false otherwise
   */
  async isFollowing(userId, comicId) {
    try {
      const follow = await Follow.findOne({
        accountId: userId,
        comicId: comicId
      });

      return !!follow;
    } catch (error) {
      logger.error('FollowService: Error checking follow status', {
        userId,
        comicId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get followers by comic ID
   * @param {string} comicId - Comic ID
   * @returns {Promise<Array>} Array of user IDs following the comic
   */
  async getFollowersByComicId(comicId) {
    try {
      const follows = await Follow.find({ comicId })
        .select('accountId')
        .lean();

      const followerIds = follows.map(f => f.accountId.toString());

      logger.info('FollowService: Retrieved followers for comic', { 
        comicId, 
        count: followerIds.length 
      });

      return followerIds;
    } catch (error) {
      logger.error('FollowService: Error getting followers by comic ID', {
        comicId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new FollowService();
