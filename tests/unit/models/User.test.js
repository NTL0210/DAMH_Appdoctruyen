const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../../src/models/User');

let mongoServer;

describe('User Model', () => {
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
    await User.deleteMany({});
  });

  test('should create a valid user with email/password', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  test('should create a valid user with Google OAuth', async () => {
    const userData = {
      username: 'googleuser',
      email: 'google@example.com',
      googleId: 'google123456'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.googleId).toBe(userData.googleId);
    expect(savedUser.password).toBeUndefined();
  });

  test('should enforce unique username', async () => {
    const userData = {
      username: 'duplicate',
      email: 'user1@example.com',
      password: 'password123'
    };

    await new User(userData).save();

    const duplicateUser = new User({
      username: 'duplicate',
      email: 'user2@example.com',
      password: 'password456'
    });

    await expect(duplicateUser.save()).rejects.toThrow();
  });

  test('should enforce unique email', async () => {
    const userData = {
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    await new User(userData).save();

    const duplicateUser = new User({
      username: 'user2',
      email: 'duplicate@example.com',
      password: 'password456'
    });

    await expect(duplicateUser.save()).rejects.toThrow();
  });

  test('should validate email format', async () => {
    const userData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123'
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  test('should require password for non-Google users', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com'
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });
});
