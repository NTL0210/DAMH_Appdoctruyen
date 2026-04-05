const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Comment = require('../../../src/models/Comment');

let mongoServer;

describe('Comment Model', () => {
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
    await Comment.deleteMany({});
  });

  test('should create a valid comment', async () => {
    const commentData = {
      comicId: 'comic-123',
      userId: new mongoose.Types.ObjectId(),
      userName: 'testuser',
      content: 'This is a great comic!'
    };

    const comment = new Comment(commentData);
    const savedComment = await comment.save();

    expect(savedComment._id).toBeDefined();
    expect(savedComment.comicId).toBe(commentData.comicId);
    expect(savedComment.userId.toString()).toBe(commentData.userId.toString());
    expect(savedComment.userName).toBe(commentData.userName);
    expect(savedComment.content).toBe(commentData.content);
    expect(savedComment.parentCommentId).toBeNull();
    expect(savedComment.createdAt).toBeDefined();
    expect(savedComment.updatedAt).toBeDefined();
  });

  test('should create a reply with parentCommentId', async () => {
    const parentComment = await new Comment({
      comicId: 'comic-123',
      userId: new mongoose.Types.ObjectId(),
      userName: 'user1',
      content: 'Parent comment'
    }).save();

    const replyData = {
      comicId: 'comic-123',
      userId: new mongoose.Types.ObjectId(),
      userName: 'user2',
      content: 'Reply to parent',
      parentCommentId: parentComment._id
    };

    const reply = new Comment(replyData);
    const savedReply = await reply.save();

    expect(savedReply.parentCommentId.toString()).toBe(parentComment._id.toString());
  });

  test('should enforce maxlength on content', async () => {
    const commentData = {
      comicId: 'comic-123',
      userId: new mongoose.Types.ObjectId(),
      userName: 'testuser',
      content: 'a'.repeat(1001)
    };

    const comment = new Comment(commentData);
    await expect(comment.save()).rejects.toThrow();
  });
});
