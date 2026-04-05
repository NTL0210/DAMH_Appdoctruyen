const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Comic = require('../../../src/models/Comic');

let mongoServer;

describe('Comic Model', () => {
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
    await Comic.deleteMany({});
  });

  test('should create a valid comic', async () => {
    const comicData = {
      comicId: 'comic-123',
      name: 'Test Comic',
      slug: 'test-comic',
      originName: 'テストコミック',
      status: 'ongoing',
      thumbUrl: 'https://example.com/thumb.jpg',
      chaptersLatest: [
        { chapterId: 'ch1', chapterName: 'Chapter 1', chapterTitle: 'Beginning' }
      ],
      comicGenres: [
        { genreId: 'action', name: 'Action' }
      ]
    };

    const comic = new Comic(comicData);
    const savedComic = await comic.save();

    expect(savedComic._id).toBeDefined();
    expect(savedComic.comicId).toBe(comicData.comicId);
    expect(savedComic.name).toBe(comicData.name);
    expect(savedComic.slug).toBe(comicData.slug);
    expect(savedComic.status).toBe(comicData.status);
    expect(savedComic.chaptersLatest).toHaveLength(1);
    expect(savedComic.comicGenres).toHaveLength(1);
    expect(savedComic.createdAt).toBeDefined();
    expect(savedComic.updatedAt).toBeDefined();
  });

  test('should enforce unique comicId', async () => {
    const comicData = {
      comicId: 'duplicate-id',
      name: 'Comic 1',
      slug: 'comic-1'
    };

    await new Comic(comicData).save();

    const duplicateComic = new Comic({
      comicId: 'duplicate-id',
      name: 'Comic 2',
      slug: 'comic-2'
    });

    await expect(duplicateComic.save()).rejects.toThrow();
  });

  test('should enforce unique slug', async () => {
    const comicData = {
      comicId: 'comic-1',
      name: 'Comic 1',
      slug: 'duplicate-slug'
    };

    await new Comic(comicData).save();

    const duplicateComic = new Comic({
      comicId: 'comic-2',
      name: 'Comic 2',
      slug: 'duplicate-slug'
    });

    await expect(duplicateComic.save()).rejects.toThrow();
  });

  test('should validate status enum', async () => {
    const comicData = {
      comicId: 'comic-123',
      name: 'Test Comic',
      slug: 'test-comic',
      status: 'invalid-status'
    };

    const comic = new Comic(comicData);
    await expect(comic.save()).rejects.toThrow();
  });
});
