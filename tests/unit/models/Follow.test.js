const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Follow = require('../../../src/models/Follow');

let mongoServer;

describe('Follow Model', () => {
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
    await Follow.deleteMany({});
  });

  test('should create a valid follow', async () => {
    const followData = {
      accountId: new mongoose.Types.ObjectId(),
      comicId: 'comic-123'
    };

    const follow = new Follow(followData);
    const savedFollow = await follow.save();

    expect(savedFollow._id).toBeDefined();
    expect(savedFollow.accountId.toString()).toBe(followData.accountId.toString());
    expect(savedFollow.comicId).toBe(followData.comicId);
    expect(savedFollow.createdAt).toBeDefined();
  });

  test('should enforce compound unique index on accountId and comicId', async () => {
    const followData = {
      accountId: new mongoose.Types.ObjectId(),
      comicId: 'comic-123'
    };

    await new Follow(followData).save();

    const duplicateFollow = new Follow(followData);
    await expect(duplicateFollow.save()).rejects.toThrow();
  });

  test('should allow same user to follow different comics', async () => {
    const accountId = new mongoose.Types.ObjectId();

    const follow1 = new Follow({
      accountId,
      comicId: 'comic-1'
    });

    const follow2 = new Follow({
      accountId,
      comicId: 'comic-2'
    });

    await follow1.save();
    await expect(follow2.save()).resolves.toBeDefined();
  });

  test('should allow different users to follow same comic', async () => {
    const comicId = 'comic-123';

    const follow1 = new Follow({
      accountId: new mongoose.Types.ObjectId(),
      comicId
    });

    const follow2 = new Follow({
      accountId: new mongoose.Types.ObjectId(),
      comicId
    });

    await follow1.save();
    await expect(follow2.save()).resolves.toBeDefined();
  });
});
