const profileController = require('../../../src/controllers/profileController');
const User = require('../../../src/models/User');
const fileService = require('../../../src/services/fileService');

jest.mock('../../../src/models/User');
jest.mock('../../../src/services/fileService');

describe('ProfileController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
      body: {},
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: '/uploads/avatars/test.jpg'
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await profileController.getProfile(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          username: 'testuser',
          email: 'test@example.com',
          avatarUrl: '/uploads/avatars/test.jpg'
        }
      });
    });

    it('should return null avatarUrl when not set', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: null
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await profileController.getProfile(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          username: 'testuser',
          email: 'test@example.com',
          avatarUrl: null
        }
      });
    });

    it('should return 404 when user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await profileController.getProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    });

    it('should call next with error on exception', async () => {
      const error = new Error('Database error');
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(error)
      });

      await profileController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUsername', () => {
    it('should update username successfully', async () => {
      req.body.username = 'newusername';

      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'user123',
          username: 'newusername',
          email: 'test@example.com',
          avatarUrl: null
        })
      });

      await profileController.updateUsername(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        username: 'newusername',
        _id: { $ne: 'user123' }
      });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { username: 'newusername' },
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          username: 'newusername',
          email: 'test@example.com',
          avatarUrl: null
        }
      });
    });

    it('should return 400 when username is missing', async () => {
      req.body.username = '';

      await profileController.updateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Username is required'
        }
      });
    });

    it('should return 400 when username is only whitespace', async () => {
      req.body.username = '   ';

      await profileController.updateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Username is required'
        }
      });
    });

    it('should return 400 when username is already taken', async () => {
      req.body.username = 'existinguser';

      User.findOne.mockResolvedValue({
        _id: 'otheruser',
        username: 'existinguser'
      });

      await profileController.updateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Username is already taken'
        }
      });
    });

    it('should return 404 when user not found', async () => {
      req.body.username = 'newusername';

      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await profileController.updateUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    });

    it('should call next with error on exception', async () => {
      req.body.username = 'newusername';
      const error = new Error('Database error');

      User.findOne.mockRejectedValue(error);

      await profileController.updateUsername(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      req.file = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test')
      };

      const mockCurrentUser = {
        _id: 'user123',
        avatarUrl: '/uploads/avatars/old.jpg'
      };

      const mockUpdatedUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: '/uploads/avatars/new.jpg'
      };

      fileService.uploadAvatar.mockResolvedValue('/uploads/avatars/new.jpg');
      User.findById.mockResolvedValue(mockCurrentUser);
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });
      fileService.deleteFile.mockResolvedValue();

      await profileController.uploadAvatar(req, res, next);

      expect(fileService.uploadAvatar).toHaveBeenCalledWith(req.file, 'user123');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { avatarUrl: '/uploads/avatars/new.jpg' },
        { new: true, runValidators: true }
      );
      expect(fileService.deleteFile).toHaveBeenCalledWith('/uploads/avatars/old.jpg');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          username: 'testuser',
          email: 'test@example.com',
          avatarUrl: '/uploads/avatars/new.jpg'
        }
      });
    });

    it('should return 400 when no file provided', async () => {
      req.file = null;

      await profileController.uploadAvatar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'No file provided'
        }
      });
    });

    it('should return 400 for invalid file type', async () => {
      req.file = {
        mimetype: 'image/gif',
        size: 1024 * 1024,
        buffer: Buffer.from('test')
      };

      fileService.uploadAvatar.mockRejectedValue(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed'));

      await profileController.uploadAvatar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
        }
      });
    });

    it('should return 400 for file size exceeds limit', async () => {
      req.file = {
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
        buffer: Buffer.from('test')
      };

      fileService.uploadAvatar.mockRejectedValue(new Error('File size exceeds maximum allowed size of 5MB'));

      await profileController.uploadAvatar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'File size exceeds maximum allowed size of 5MB'
        }
      });
    });

    it('should not fail if old avatar deletion fails', async () => {
      req.file = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test')
      };

      const mockCurrentUser = {
        _id: 'user123',
        avatarUrl: '/uploads/avatars/old.jpg'
      };

      const mockUpdatedUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: '/uploads/avatars/new.jpg'
      };

      fileService.uploadAvatar.mockResolvedValue('/uploads/avatars/new.jpg');
      User.findById.mockResolvedValue(mockCurrentUser);
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });
      fileService.deleteFile.mockRejectedValue(new Error('File not found'));

      // Mock console.error to avoid test output pollution
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await profileController.uploadAvatar(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          username: 'testuser',
          email: 'test@example.com',
          avatarUrl: '/uploads/avatars/new.jpg'
        }
      });

      consoleErrorSpy.mockRestore();
    });

    it('should call next with error on exception', async () => {
      req.file = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test')
      };

      const error = new Error('Database error');
      fileService.uploadAvatar.mockResolvedValue('/uploads/avatars/new.jpg');
      User.findById.mockRejectedValue(error);

      await profileController.uploadAvatar(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
