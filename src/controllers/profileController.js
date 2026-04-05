const User = require('../models/User');
const fileService = require('../services/fileService');

/**
 * Profile Controller
 * Handles user profile operations
 */

/**
 * Get authenticated user's profile
 * @route GET /profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update username
 * @route PUT /profile/username
 */
exports.updateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Username is required'
        }
      });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ 
      username: username.trim(),
      _id: { $ne: req.user.userId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Username is already taken'
        }
      });
    }

    // Update username
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username: username.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload avatar
 * @route POST /profile/avatar
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'No file provided'
        }
      });
    }

    // Upload and process avatar
    const avatarUrl = await fileService.uploadAvatar(req.file, req.user.userId);

    // Get current user to delete old avatar
    const currentUser = await User.findById(req.user.userId);
    const oldAvatarUrl = currentUser?.avatarUrl;

    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatarUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Delete old avatar if exists
    if (oldAvatarUrl) {
      try {
        await fileService.deleteFile(oldAvatarUrl);
      } catch (error) {
        // Log but don't fail the request
        console.error('Failed to delete old avatar:', error);
      }
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    // Handle file service errors
    if (error.message.includes('Invalid file type') || 
        error.message.includes('File size exceeds') ||
        error.message.includes('Avatar upload failed')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: error.message
        }
      });
    }
    next(error);
  }
};
