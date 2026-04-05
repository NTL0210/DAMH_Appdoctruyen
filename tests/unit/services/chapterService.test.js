const chapterService = require('../../../src/services/chapterService');
const Chapter = require('../../../src/models/Chapter');
const cacheService = require('../../../src/services/cacheService');

jest.mock('../../../src/models/Chapter');
jest.mock('../../../src/services/cacheService');
jest.mock('../../../src/utils/logger');

describe('ChapterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChaptersByComicId', () => {
    it('should return chapters sorted by chapterIndex from database when cache miss', async () => {
      const mockChapters = [
        { _id: '1', comicId: 'comic-1', chapterName: 'Chapter 1', chapterIndex: 1 },
        { _id: '2', comicId: 'comic-1', chapterName: 'Chapter 2', chapterIndex: 2 }
      ];

      cacheService.get.mockResolvedValue(null);
      Chapter.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockChapters)
      });

      const result = await chapterService.getChaptersByComicId('comic-1');

      expect(result).toEqual(mockChapters);
      expect(Chapter.find).toHaveBeenCalledWith({ comicId: 'comic-1' });
      expect(Chapter.find().sort).toHaveBeenCalledWith({ chapterIndex: 1 });
      expect(cacheService.set).toHaveBeenCalledWith(
        'chapters:comic:comic-1',
        JSON.stringify(mockChapters),
        600
      );
    });

    it('should return cached chapters when cache hit', async () => {
      const cachedChapters = [
        { _id: '1', comicId: 'comic-1', chapterName: 'Cached Chapter' }
      ];

      cacheService.get.mockResolvedValue(JSON.stringify(cachedChapters));

      const result = await chapterService.getChaptersByComicId('comic-1');

      expect(result).toEqual(cachedChapters);
      expect(Chapter.find).not.toHaveBeenCalled();
    });

    it('should return empty array when no chapters found', async () => {
      cacheService.get.mockResolvedValue(null);
      Chapter.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      const result = await chapterService.getChaptersByComicId('comic-nonexistent');

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      cacheService.get.mockResolvedValue(null);
      Chapter.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(chapterService.getChaptersByComicId('comic-1')).rejects.toThrow('Database error');
    });
  });

  describe('getChapterById', () => {
    it('should return chapter by ID', async () => {
      const mockChapter = {
        _id: 'chapter-1',
        comicId: 'comic-1',
        chapterName: 'Chapter 1',
        chapterIndex: 1
      };

      Chapter.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockChapter)
      });

      const result = await chapterService.getChapterById('chapter-1');

      expect(result).toEqual(mockChapter);
      expect(Chapter.findById).toHaveBeenCalledWith('chapter-1');
    });

    it('should return null when chapter not found', async () => {
      Chapter.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await chapterService.getChapterById('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      Chapter.findById.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(chapterService.getChapterById('chapter-1')).rejects.toThrow('Database error');
    });
  });

  describe('getChapterPages', () => {
    it('should return parsed pages from chapterApiData', async () => {
      const mockChapter = {
        _id: 'chapter-1',
        chapterApiData: JSON.stringify(['http://example.com/page1.jpg', 'http://example.com/page2.jpg'])
      };

      Chapter.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockChapter)
      });

      const result = await chapterService.getChapterPages('chapter-1');

      expect(result).toEqual(['http://example.com/page1.jpg', 'http://example.com/page2.jpg']);
    });

    it('should return empty array when chapter not found', async () => {
      Chapter.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await chapterService.getChapterPages('nonexistent');

      expect(result).toEqual([]);
    });

    it('should return empty array when chapterApiData is empty', async () => {
      const mockChapter = {
        _id: 'chapter-1',
        chapterApiData: ''
      };

      Chapter.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockChapter)
      });

      const result = await chapterService.getChapterPages('chapter-1');

      expect(result).toEqual([]);
    });
  });

  describe('parseChapterApiData', () => {
    it('should parse array of URLs', () => {
      const data = JSON.stringify(['http://example.com/page1.jpg', 'http://example.com/page2.jpg']);
      const result = chapterService.parseChapterApiData(data);

      expect(result).toEqual(['http://example.com/page1.jpg', 'http://example.com/page2.jpg']);
    });

    it('should parse object with pages array', () => {
      const data = JSON.stringify({
        pages: ['http://example.com/page1.jpg', 'http://example.com/page2.jpg']
      });
      const result = chapterService.parseChapterApiData(data);

      expect(result).toEqual(['http://example.com/page1.jpg', 'http://example.com/page2.jpg']);
    });

    it('should parse object with images array', () => {
      const data = JSON.stringify({
        images: ['http://example.com/page1.jpg', 'http://example.com/page2.jpg']
      });
      const result = chapterService.parseChapterApiData(data);

      expect(result).toEqual(['http://example.com/page1.jpg', 'http://example.com/page2.jpg']);
    });

    it('should parse object with URL properties', () => {
      const data = JSON.stringify({
        page1: 'http://example.com/page1.jpg',
        page2: 'http://example.com/page2.jpg'
      });
      const result = chapterService.parseChapterApiData(data);

      expect(result.length).toBe(2);
      expect(result).toContain('http://example.com/page1.jpg');
      expect(result).toContain('http://example.com/page2.jpg');
    });

    it('should filter out empty strings', () => {
      const data = JSON.stringify(['http://example.com/page1.jpg', '', 'http://example.com/page2.jpg']);
      const result = chapterService.parseChapterApiData(data);

      expect(result).toEqual(['http://example.com/page1.jpg', 'http://example.com/page2.jpg']);
    });

    it('should return empty array for empty string', () => {
      const result = chapterService.parseChapterApiData('');

      expect(result).toEqual([]);
    });

    it('should return empty array for invalid JSON', () => {
      const result = chapterService.parseChapterApiData('invalid json');

      expect(result).toEqual([]);
    });

    it('should return empty array for null', () => {
      const result = chapterService.parseChapterApiData(null);

      expect(result).toEqual([]);
    });
  });

  describe('invalidateChapterCache', () => {
    it('should delete chapter cache for comic', async () => {
      await chapterService.invalidateChapterCache('comic-1');

      expect(cacheService.del).toHaveBeenCalledWith('chapters:comic:comic-1');
    });

    it('should handle errors gracefully', async () => {
      cacheService.del.mockRejectedValue(new Error('Cache error'));

      await expect(chapterService.invalidateChapterCache('comic-1')).resolves.not.toThrow();
    });
  });
});
