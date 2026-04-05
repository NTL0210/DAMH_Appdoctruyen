const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase, getConnectionStatus } = require('../../../src/config/database');
const logger = require('../../../src/utils/logger');

// Mock logger to prevent console output during tests
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    on: jest.fn(),
    readyState: 1,
    host: 'localhost',
    name: 'test-db'
  }
}));

describe('Database Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
  });

  afterEach(() => {
    delete process.env.MONGODB_URI;
  });

  describe('connectDatabase', () => {
    it('should connect successfully on first attempt', async () => {
      mongoose.connect.mockResolvedValueOnce();

      await connectDatabase();

      expect(mongoose.connect).toHaveBeenCalledTimes(1);
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test-db',
        expect.objectContaining({
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('MongoDB connected successfully'),
        expect.any(Object)
      );
    });

    it('should throw error if MONGODB_URI is not defined', async () => {
      delete process.env.MONGODB_URI;

      await expect(connectDatabase()).rejects.toThrow(
        'MONGODB_URI environment variable is not defined'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Database configuration error',
        expect.any(Object)
      );
    });

    it('should retry with exponential backoff on connection failure', async () => {
      const connectionError = new Error('Connection failed');
      mongoose.connect
        .mockRejectedValueOnce(connectionError)
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce();

      const startTime = Date.now();
      await connectDatabase();
      const duration = Date.now() - startTime;

      // Should have retried twice (1s + 2s = 3s total delay)
      expect(mongoose.connect).toHaveBeenCalledTimes(3);
      expect(duration).toBeGreaterThanOrEqual(3000);
      expect(logger.error).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Retrying connection'),
        expect.anything()
      );
    });

    it('should fail after 3 retries', async () => {
      const connectionError = new Error('Connection failed');
      mongoose.connect.mockRejectedValue(connectionError);

      await expect(connectDatabase()).rejects.toThrow(
        'Failed to connect to MongoDB after 4 attempts'
      );

      expect(mongoose.connect).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(logger.error).toHaveBeenCalledWith(
        'MongoDB connection failed permanently',
        expect.any(Object)
      );
    });
  });

  describe('disconnectDatabase', () => {
    it('should disconnect successfully', async () => {
      mongoose.disconnect.mockResolvedValueOnce();

      await disconnectDatabase();

      expect(mongoose.disconnect).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('MongoDB disconnected successfully');
    });

    it('should throw error on disconnect failure', async () => {
      const disconnectError = new Error('Disconnect failed');
      mongoose.disconnect.mockRejectedValueOnce(disconnectError);

      await expect(disconnectDatabase()).rejects.toThrow('Disconnect failed');
      expect(logger.error).toHaveBeenCalledWith(
        'Error disconnecting from MongoDB',
        expect.any(Object)
      );
    });
  });

  describe('getConnectionStatus', () => {
    it('should return correct connection status', () => {
      mongoose.connection.readyState = 0;
      expect(getConnectionStatus()).toBe('disconnected');

      mongoose.connection.readyState = 1;
      expect(getConnectionStatus()).toBe('connected');

      mongoose.connection.readyState = 2;
      expect(getConnectionStatus()).toBe('connecting');

      mongoose.connection.readyState = 3;
      expect(getConnectionStatus()).toBe('disconnecting');

      mongoose.connection.readyState = 99;
      expect(getConnectionStatus()).toBe('unknown');
    });
  });
});
