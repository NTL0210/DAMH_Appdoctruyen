const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB connection configuration with retry mechanism
 * Implements exponential backoff for connection failures
 */

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current retry attempt (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getRetryDelay = (attempt) => {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
};

/**
 * Sleep for specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Connect to MongoDB with retry mechanism
 * @param {number} attempt - Current attempt number (default: 0)
 * @returns {Promise<void>}
 * @throws {Error} If connection fails after all retries
 */
const connectDatabase = async (attempt = 0) => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    const error = new Error('MONGODB_URI environment variable is not defined');
    logger.error('Database configuration error', { error: error.message });
    throw error;
  }

  try {
    logger.info(`Attempting to connect to MongoDB (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error(`MongoDB connection failed (attempt ${attempt + 1}/${MAX_RETRIES + 1})`, {
      error: error.message,
      code: error.code
    });

    if (attempt < MAX_RETRIES) {
      const delay = getRetryDelay(attempt);
      logger.info(`Retrying connection in ${delay}ms...`);
      await sleep(delay);
      return connectDatabase(attempt + 1);
    } else {
      const finalError = new Error(`Failed to connect to MongoDB after ${MAX_RETRIES + 1} attempts`);
      logger.error('MongoDB connection failed permanently', {
        error: finalError.message,
        lastError: error.message
      });
      throw finalError;
    }
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error: error.message });
    throw error;
  }
};

/**
 * Get database connection status
 * @returns {string} Connection state
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getConnectionStatus
};
