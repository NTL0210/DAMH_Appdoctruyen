const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Chapter = require('../../../src/models/Chapter');

let mongoServer;

describe('Chapter Model', () => {
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
    await Chapter.deleteMany({});
  });

  test('should create a valid chapter', async () => {
    const chapterData = {
      comicId: 'comic-123',
      slug: 'chapter-1',
      chapterName: 'Chapter 1',
      chapterTitle: 'The Beginning',
      chapterIndex: 1,
      chapterApiData: '{"pages": ["page1.jpg", "page2.jpg"]}',
      serverName: 'server1',
      filename: 'chapter1.json'
    };

    const chapter = new Chapter(chapterData);
    const savedChapter = await chapter.save();

    expect(savedChapter._id).toBeDefined();
    expect(savedChapter.comicId).toBe(chapterData.comicId);
    expect(savedChapter.slug).toBe(chapterData.slug);
    expect(savedChapter.chapterName).toBe(chapterData.chapterName);
    expect(savedChapter.chapterIndex).toBe(chapterData.chapterIndex);
    expect(savedChapter.createdAt).toBeDefined();
    expect(savedChapter.updatedAt).toBeDefined();
  });

  test('should enforce compound unique index on comicId and chapterIndex', async () => {
    const chapterData = {
      comicId: 'comic-123',
      slug: 'chapter-1',
      chapterName: 'Chapter 1',
      chapterIndex: 1
    };

    await new Chapter(chapterData).save();

    const duplicateChapter = new Chapter({
      comicId: 'comic-123',
      slug: 'chapter-1-duplicate',
      chapterName: 'Chapter 1 Duplicate',
      chapterIndex: 1
    });

    await expect(duplicateChapter.save()).rejects.toThrow();
  });

  test('should allow same chapterIndex for different comics', async () => {
    const chapter1 = new Chapter({
      comicId: 'comic-1',
      slug: 'chapter-1',
      chapterName: 'Chapter 1',
      chapterIndex: 1
    });

    const chapter2 = new Chapter({
      comicId: 'comic-2',
      slug: 'chapter-1',
      chapterName: 'Chapter 1',
      chapterIndex: 1
    });

    await chapter1.save();
    await expect(chapter2.save()).resolves.toBeDefined();
  });
});
