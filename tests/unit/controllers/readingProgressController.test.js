const readingProgressController = require('../../../src/controllers/readingProgressController');
const readingProgressService = require('../../../src/services/readingProgressService');

jest.mock('../../../src/services/readingProgressService');
jest.mock('../../../src/utils/logger');

describe('ReadingProgressController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { userId: 'user123', username: 'testuser', email: 'test@example.com' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      const mockProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter789',
        chapterIndex: 5,
        lastReadAt: new Date(),
        completedChapters: ['chapter789']
      };

      readingProgressService.updateProgress.mockResolvedValue(mockProgress);
      req.body = { comicId: 'comic456', chapterId: 'chapter789', chapterIndex: 5 };

      await readingProgressController.updateProgress(req, res);

      expect(readingProgressService.updateProgress).toHaveBeenCalledWith(
        'user123',
        'comic456',
        'chapter789',
        5
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProgress
      });
    });

    it('should default chapterIndex to 0 when not provided', async () => {
      const mockProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter789',
        chapterIndex: 0
      };

      readingProgressService.updateProgress.mockResolvedValue(mockProgress);
      req.body = { comicId: 'comic456', chapterId: 'chapter789' };

      await readingProgressController.updateProgress(req, res);

      expect(readingProgressService.updateProgress).toHaveBeenCalledWith(
        'user123',
        'comic456',
        'chapter789',
        0
      );
    });

    it('should return 400 when comicId is missing', async () => {
      req.body = { chapterId: 'chapter789' };

      await readingProgressController.updateProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'comicId and chapterId are required'
        }
      });
    });

    it('should return 400 when chapterId is missing', async () => {
      req.body = { comicId: 'comic456' };

      await readingProgressController.updateProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'comicId and chapterId are required'
        }
      });
    });

    it('should handle service errors', async () => {
      readingProgressService.updateProgress.mockRejectedValue(new Error('Database error'));
      req.body = { comicId: 'comic456', chapterId: 'chapter789' };

      await readingProgressController.updateProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update reading progress'
        }
      });
    });
  });

  describe('getProgress', () => {
    it('should return progress for a specific comic', async () => {
      const mockProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter789',
        chapterIndex: 5,
        completedChapters: ['chapter100', 'chapter789']
      };

      readingProgressService.getProgress.mockResolvedValue(mockProgress);
      req.params.comicId = 'comic456';

      await readingProgressController.getProgress(req, res);

      expect(readingProgressService.getProgress).toHaveBeenCalledWith('user123', 'comic456');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProgress
      });
    });

    it('should return null when no progress exists', async () => {
      readingProgressService.getProgress.mockResolvedValue(null);
      req.params.comicId = 'comic456';

      await readingProgressController.getProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'No reading progress found for this comic'
      });
    });

    it('should return 400 when comicId is missing', async () => {
      req.params.comicId = '';

      await readingProgressController.getProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'comicId is required'
        }
      });
    });

    it('should handle service errors', async () => {
      readingProgressService.getProgress.mockRejectedValue(new Error('Database error'));
      req.params.comicId = 'comic456';

      await readingProgressController.getProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve reading progress'
        }
      });
    });
  });

  describe('getProgressList', () => {
    it('should return all progress records for user', async () => {
      const mockProgressList = [
        {
          accountId: 'user123',
          comicId: 'comic1',
          chapterId: 'chapter1',
          lastReadAt: new Date('2024-01-15')
        },
        {
          accountId: 'user123',
          comicId: 'comic2',
          chapterId: 'chapter5',
          lastReadAt: new Date('2024-01-14')
        }
      ];

      readingProgressService.getProgressList.mockResolvedValue(mockProgressList);

      await readingProgressController.getProgressList(req, res);

      expect(readingProgressService.getProgressList).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProgressList
      });
    });

    it('should return empty array when no progress exists', async () => {
      readingProgressService.getProgressList.mockResolvedValue([]);

      await readingProgressController.getProgressList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it('should handle service errors', async () => {
      readingProgressService.getProgressList.mockRejectedValue(new Error('Database error'));

      await readingProgressController.getProgressList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve reading progress list'
        }
      });
    });
  });
});
