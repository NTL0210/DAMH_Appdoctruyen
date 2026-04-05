const chapterController = require('../../../src/controllers/chapterController');
const chapterService = require('../../../src/services/chapterService');

jest.mock('../../../src/services/chapterService');
jest.mock('../../../src/utils/logger');

describe('ChapterController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getChaptersByComicId', () => {
    it('should return chapters for a comic successfully', async () => {
      const mockChapters = [
        { _id: '1', comicId: 'comic-1', chapterName: 'Chapter 1', chapterIndex: 1 },
        { _id: '2', comicId: 'comic-1', chapterName: 'Chapter 2', chapterIndex: 2 }
      ];

      chapterService.getChaptersByComicId.mockResolvedValue(mockChapters);
      req.params.comicId = 'comic-1';

      await chapterController.getChaptersByComicId(req, res);

      expect(chapterService.getChaptersByComicId).toHaveBeenCalledWith('comic-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockChapters
      });
    });

    it('should return empty array when no chapters found', async () => {
      chapterService.getChaptersByComicId.mockResolvedValue([]);
      req.params.comicId = 'comic-nonexistent';

      await chapterController.getChaptersByComicId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it('should return 400 when comicId is missing', async () => {
      req.params.comicId = '';

      await chapterController.getChaptersByComicId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Comic ID is required'
        }
      });
    });

    it('should handle service errors', async () => {
      chapterService.getChaptersByComicId.mockRejectedValue(new Error('Database error'));
      req.params.comicId = 'comic-1';

      await chapterController.getChaptersByComicId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve chapters'
        }
      });
    });
  });

  describe('getChapterById', () => {
    it('should return chapter by ID successfully', async () => {
      const mockChapter = {
        _id: 'chapter-1',
        comicId: 'comic-1',
        chapterName: 'Chapter 1',
        chapterIndex: 1
      };

      chapterService.getChapterById.mockResolvedValue(mockChapter);
      req.params.id = 'chapter-1';

      await chapterController.getChapterById(req, res);

      expect(chapterService.getChapterById).toHaveBeenCalledWith('chapter-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockChapter
      });
    });

    it('should return 404 when chapter not found', async () => {
      chapterService.getChapterById.mockResolvedValue(null);
      req.params.id = 'nonexistent';

      await chapterController.getChapterById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chapter not found'
        }
      });
    });

    it('should return 400 when ID is missing', async () => {
      req.params.id = '';

      await chapterController.getChapterById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Chapter ID is required'
        }
      });
    });

    it('should handle service errors', async () => {
      chapterService.getChapterById.mockRejectedValue(new Error('Database error'));
      req.params.id = 'chapter-1';

      await chapterController.getChapterById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve chapter'
        }
      });
    });
  });

  describe('getChapterPages', () => {
    it('should return chapter pages successfully', async () => {
      const mockChapter = {
        _id: 'chapter-1',
        chapterApiData: JSON.stringify(['http://example.com/page1.jpg', 'http://example.com/page2.jpg'])
      };
      const mockPages = ['http://example.com/page1.jpg', 'http://example.com/page2.jpg'];

      chapterService.getChapterPages.mockResolvedValue(mockPages);
      chapterService.getChapterById.mockResolvedValue(mockChapter);
      req.params.id = 'chapter-1';

      await chapterController.getChapterPages(req, res);

      expect(chapterService.getChapterPages).toHaveBeenCalledWith('chapter-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPages
      });
    });

    it('should return 404 when chapter not found', async () => {
      chapterService.getChapterPages.mockResolvedValue([]);
      chapterService.getChapterById.mockResolvedValue(null);
      req.params.id = 'nonexistent';

      await chapterController.getChapterPages(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chapter not found'
        }
      });
    });

    it('should return empty array when chapter has no pages', async () => {
      const mockChapter = {
        _id: 'chapter-1',
        chapterApiData: ''
      };

      chapterService.getChapterPages.mockResolvedValue([]);
      chapterService.getChapterById.mockResolvedValue(mockChapter);
      req.params.id = 'chapter-1';

      await chapterController.getChapterPages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it('should return 400 when ID is missing', async () => {
      req.params.id = '';

      await chapterController.getChapterPages(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Chapter ID is required'
        }
      });
    });

    it('should handle service errors', async () => {
      chapterService.getChapterPages.mockRejectedValue(new Error('Database error'));
      req.params.id = 'chapter-1';

      await chapterController.getChapterPages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve chapter pages'
        }
      });
    });
  });
});
