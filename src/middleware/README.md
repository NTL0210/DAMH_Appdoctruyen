# Middleware Documentation

## Authentication Middleware

The `auth.js` middleware provides JWT token verification for protected routes.

### Usage

```javascript
const express = require('express');
const authMiddleware = require('./middleware/auth');

const app = express();

// Public route - no authentication required
app.get('/api/comics', (req, res) => {
  // Anyone can access
});

// Protected route - authentication required
app.get('/api/profile', authMiddleware, (req, res) => {
  // req.user contains: { userId, username, email }
  res.json({
    success: true,
    data: req.user
  });
});

// Multiple protected routes
app.post('/api/comments', authMiddleware, (req, res) => {
  const { userId } = req.user;
  // Create comment for authenticated user
});

app.post('/api/follows', authMiddleware, (req, res) => {
  const { userId } = req.user;
  // Follow comic for authenticated user
});
```

### Request Format

Clients must include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Response Codes

- **200**: Token valid, user authenticated
- **401**: Authentication failed (missing, expired, or invalid token)
- **500**: Internal server error

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "JWT token has expired"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Codes

- `UNAUTHORIZED`: Missing or malformed Authorization header
- `TOKEN_EXPIRED`: JWT token has expired (7 days)
- `TOKEN_INVALID`: Invalid or tampered JWT token
- `INTERNAL_ERROR`: Unexpected server error

### User Object

After successful authentication, `req.user` contains:

```javascript
{
  userId: string,    // User's database ID
  username: string,  // User's username
  email: string      // User's email
}
```

### Environment Variables

- `JWT_SECRET`: Secret key for JWT verification (required in production)

### Testing

Run unit tests:
```bash
npm test tests/unit/middleware/auth.test.js
```

### Security Notes

- Always use HTTPS in production to protect tokens in transit
- Set a strong `JWT_SECRET` environment variable
- Tokens expire after 7 days (configured in authService)
- Failed authentication attempts are logged for security monitoring
