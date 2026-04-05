const jwt = require('jsonwebtoken');

/**
 * Socket.io authentication middleware
 * Verifies JWT token from handshake auth or query
 */
const socketAuth = (socket, next) => {
  try {
    // Get token from auth header or query parameter
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to socket
    socket.data.userId = decoded.userId;
    socket.data.username = decoded.username;
    socket.data.email = decoded.email;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    }
    return next(new Error('Authentication failed'));
  }
};

module.exports = socketAuth;
