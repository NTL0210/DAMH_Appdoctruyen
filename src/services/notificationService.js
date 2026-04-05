const Follow = require('../models/Follow');

class NotificationService {
  constructor() {
    this.io = null;
    this.notificationQueue = new Map(); // comicId -> { notifications: [], timeout: timeoutId }
    this.batchWindowMs = 5000; // 5 seconds
  }

  /**
   * Initialize Socket.io instance
   * @param {Object} io - Socket.io server instance
   */
  initialize(io) {
    this.io = io;
  }

  /**
   * Notify followers of a new chapter
   * @param {String} comicId - Comic ID
   * @param {Object} chapterData - Chapter information
   */
  async notifyNewChapter(comicId, chapterData) {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }

    const notification = {
      comicId,
      comicSlug: chapterData.comicSlug,
      comicName: chapterData.comicName,
      chapterName: chapterData.chapterName,
      message: `New chapter available: ${chapterData.chapterName}`,
      timestamp: new Date().toISOString()
    };

    // Add to batch queue
    await this.batchNotifications(comicId, notification);
  }

  /**
   * Batch notifications within a time window to prevent spam
   * @param {String} comicId - Comic ID
   * @param {Object} notification - Notification data
   */
  async batchNotifications(comicId, notification) {
    if (!this.notificationQueue.has(comicId)) {
      // First notification for this comic, create queue entry
      this.notificationQueue.set(comicId, {
        notifications: [notification],
        timeout: setTimeout(() => this.flushNotifications(comicId), this.batchWindowMs)
      });
    } else {
      // Add to existing queue
      const queue = this.notificationQueue.get(comicId);
      queue.notifications.push(notification);
    }
  }

  /**
   * Flush batched notifications for a comic
   * @param {String} comicId - Comic ID
   */
  async flushNotifications(comicId) {
    const queue = this.notificationQueue.get(comicId);
    if (!queue) return;

    const { notifications } = queue;
    this.notificationQueue.delete(comicId);

    // Get all followers of this comic
    const followers = await Follow.find({ comicId }).select('accountId');
    const followerIds = followers.map(f => f.accountId.toString());

    // Send batched notification
    const batchedNotification = notifications.length === 1 
      ? notifications[0]
      : {
          comicId,
          comicSlug: notifications[0].comicSlug,
          comicName: notifications[0].comicName,
          chapterName: `${notifications.length} new chapters`,
          message: `${notifications.length} new chapters available`,
          timestamp: new Date().toISOString(),
          chapters: notifications.map(n => n.chapterName)
        };

    // Emit to all connected followers
    followerIds.forEach(userId => {
      this.io.to(`user:${userId}`).emit('ReceiveCrawlNotification', batchedNotification);
    });
  }

  /**
   * Send notification to a specific user
   * @param {String} userId - User ID
   * @param {Object} notification - Notification data
   */
  async sendNotificationToUser(userId, notification) {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }

    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Get list of connected users
   * @returns {Array} Array of connected user IDs
   */
  async getConnectedUsers() {
    if (!this.io) {
      return [];
    }

    const sockets = await this.io.fetchSockets();
    return sockets.map(socket => socket.data.userId).filter(Boolean);
  }
}

module.exports = new NotificationService();
