const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ReadingProgress = require('../../../src/models/ReadingProgress');

let mongoServer;

describe('ReadingProgress Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await ReadingProgress.deleteMany({});
  });

  test('should create a valid reading progress', async () => {
    const progressData = {
      accountId: new mongoose.Types.ObjectId(),
      comicId: 'comic-123',
      chapterId: 'chapter-5',
      chapterIndex: 5,
      completedChapters: ['chapter-1', 'chapter-2', 'chapter-3']
    };

    const progress = new ReadingProgress(progressData);
    const savedProgress = await progress.save();

    expect(savedProgress._id).toBeDefined();
    expect(savedProgress.accountId.toString()).toBe(progressData.accountId.toString());
    expect(savedProgress.comicId).toBe(progressData.comicId);
    expect(savedProgress.chapterId).toBe(progressData.chapterId);
    expect(savedProgress.chapterIndex).toBe(progressData.chapterIndex);
    expect(savedProgress.completedChapters).toHaveLength(3);
    expect(savedProgress.lastReadAt).toBeDefined();
    expect(savedProgress.createdAt).toBeDefined();
    expect(savedProgress.updatedAt).toBeDefined();
  });

  test('should enforce compound unique index on accountId and comicId', async () => {
    const progressData = {
      accountId: new mongoose.Types.ObjectId(),
      comicId: 'comic-123',
      chapterId: 'chapter-1'
    };

    await new ReadingProgress(progressData).save();

    const duplicateProgress = new ReadingProgress({
      accountId: progressData.accountId,
      comicId: progressData.comicId,
      chapterId: 'chapter-2'
    });

    await expect(duplicateProgress.save()).rejects.toThrow();
  });

  test('should allow same user to have progress for different comics', async () => {
    const accountId = new mongoose.Types.ObjectId();

    const progress1 = new ReadingProgress({
      accountId,
      comicId: 'comic-1',
      chapterId: 'chapter-1'
    });

    const progress2 = new ReadingProgress({
      accountId,
      comicId: 'comic-2',
      chapterId: 'chapter-1'
    });

    await progress1.save();
    await expect(progress2.save()).resolves.toBeDefined();
  });

  test('should default completedChapters to empty array', async () => {
    const progressData = {
      accountId: new mongoose.Types.ObjectId(),
      comicId: 'comic-123',
      chapterId: 'chapter-1'
    };

    const progress = new ReadingProgress(progressData);
    const savedProgress = await progress.save();

    expect(savedProgress.completedChapters).toEqual([]);
  });
});
