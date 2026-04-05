# Comic Backend API

Backend API for comic reading platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT & Google OAuth)
- Comic catalog management with pagination and search
- Chapter reading with progress tracking
- Comments system with nested replies
- Follow system for comics
- Real-time notifications via WebSocket
- Rate limiting and security middleware
- Redis caching for performance
- Comprehensive API documentation with Swagger

## Project Structure

```
comic-backend-api/
├── src/
│   ├── config/          # Configuration files (database, redis, passport, swagger)
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Mongoose schemas
│   ├── middleware/      # Express middleware (auth, validation, rate limiting)
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.io handlers
│   └── utils/           # Utility functions
├── uploads/             # Avatar storage
├── tests/               # Test files
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── server.js            # Entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `REDIS_URL`: Redis connection URL

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

Once the server is running, access Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| GOOGLE_CLIENT_ID | Google OAuth client ID | Yes |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | Yes |
| REDIS_URL | Redis connection URL | Yes |
| NODE_ENV | Environment (development/production) | No |

## License

ISC
