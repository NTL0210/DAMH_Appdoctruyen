const readingProgressService = require('../../../src/services/readingProgressService');
const ReadingProgress = require('../../../src/models/ReadingProgress');

jest.mock('../../../src/models/ReadingProgress');
jest.mock('../../../src/utils/logger');

describe('ReadingProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('should create new progress record when none exists', async () => {
      const mockProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter789',
        chapterIndex: 5,
        lastReadAt: expect.any(Date),
        completedChapters: ['chapter789'],
        toObject: jest.fn().mockReturnValue({
          accountId: 'user123',
          comicId: 'comic456',
          chapterId: 'chapter789',
          chapterIndex: 5
        })
      };

      ReadingProgress.findOne.mockResolvedValue(null);
      ReadingProgress.create.mockResolvedValue(mockProgress);

      const result = await readingProgressService.updateProgress(
        'user123',
        'comic456',
        'chapter789',
        5
      );

      expect(ReadingProgress.findOne).toHaveBeenCalledWith({
        accountId: 'user123',
        comicId: 'comic456'
      });
      expect(ReadingProgress.create).toHaveBeenCalledWith({
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter789',
        chapterIndex: 5,
        lastReadAt: expect.any(Date),
        completedChapters: ['chapter789']
      });
      expect(result.accountId).toBe('user123');
    });

    it('should update existing progress record', async () => {
      const mockExistingProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter100',
        chapterIndex: 1,
        completedChapters: ['chapter100'],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          accountId: 'user123',
          comicId: 'comic456',
          chapterId: 'chapter200',
          chapterIndex: 2,
          completedChapters: ['chapter100', 'chapter200']
        })
      };

      ReadingProgress.findOne.mockResolvedValue(mockExistingProgress);

      const result = await readingProgressService.updateProgress(
        'user123',
        'comic456',
        'chapter200',
        2
      );

      expect(mockExistingProgress.chapterId).toBe('chapter200');
      expect(mockExistingProgress.chapterIndex).toBe(2);
      expect(mockExistingProgress.completedChapters).toContain('chapter200');
      expect(mockExistingProgress.save).toHaveBeenCalled();
    });

    it('should not duplicate chapters in completedChapters', async () => {
      const mockExistingProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        chapterId: 'chapter100',
        chapterIndex: 1,
        completedChapters: ['chapter100'],
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          accountId: 'user123',
          comicId: 'comic456',
          chapterId: 'chapter100',
          completedChapters: ['chapter100']
        })
      };

      ReadingProgress.findOne.mockResolvedValue(mockExistingProgress);

      await readingProgressService.updateProgress(
        'user123',
        'comic456',
        'chapter100',
        1
      );

      expect(mockExistingProgress.completedChapters).toEqual(['chapter100']);
      expect(mockExistingProgress.completedChapters.length).toBe(1);
    });

    it('should handle errors and throw', async () => {
      ReadingProgress.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        readingProgressService.updateProgress('user123', 'comic456', 'chapter789')
      ).rejects.toThrow('Database error');
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

      ReadingProgress.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProgress)
      });

      const result = await readingProgressService.getProgress('user123', 'comic456');

      expect(result).toEqual(mockProgress);
      expect(ReadingProgress.findOne).toHaveBeenCalledWith({
        accountId: 'user123',
        comicId: 'comic456'
      });
    });

    it('should return null when no progress exists', async () => {
      ReadingProgress.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await readingProgressService.getProgress('user123', 'comic456');

      expect(result).toBeNull();
    });

    it('should handle errors and throw', async () => {
      ReadingProgress.findOne.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(
        readingProgressService.getProgress('user123', 'comic456')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getProgressList', () => {
    it('should return all progress records for a user', async () => {
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

      ReadingProgress.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProgressList)
      });

      const result = await readingProgressService.getProgressList('user123');

      expect(result).toEqual(mockProgressList);
      expect(ReadingProgress.find).toHaveBeenCalledWith({ accountId: 'user123' });
    });

    it('should return empty array when no progress exists', async () => {
      ReadingProgress.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      const result = await readingProgressService.getProgressList('user123');

      expect(result).toEqual([]);
    });

    it('should sort by lastReadAt descending', async () => {
      ReadingProgress.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      await readingProgressService.getProgressList('user123');

      const sortCall = ReadingProgress.find().sort;
      expect(sortCall).toHaveBeenCalledWith({ lastReadAt: -1 });
    });

    it('should handle errors and throw', async () => {
      ReadingProgress.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(
        readingProgressService.getProgressList('user123')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getCompletedChapters', () => {
    it('should return completed chapters for a comic', async () => {
      const mockProgress = {
        accountId: 'user123',
        comicId: 'comic456',
        completedChapters: ['chapter1', 'chapter2', 'chapter3']
      };

      ReadingProgress.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProgress)
      });

      const result = await readingProgressService.getCompletedChapters('user123', 'comic456');

      expect(result).toEqual(['chapter1', 'chapter2', 'chapter3']);
    });

    it('should return empty array when no progress exists', async () => {
      ReadingProgress.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await readingProgressService.getCompletedChapters('user123', 'comic456');

      expect(result).toEqual([]);
    });

    it('should handle errors and throw', async () => {
      ReadingProgress.findOne.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(
        readingProgressService.getCompletedChapters('user123', 'comic456')
      ).rejects.toThrow('Database error');
    });
  });
});
