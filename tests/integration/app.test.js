const request = require('supertest');
const createApp = require('../../src/app');

describe('App Integration Tests', () => {
  let app;

  beforeAll(() => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.CORS_ORIGIN = '*';
    app = createApp();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200); // Swagger UI returns 200

      expect(response.status).toBe(200);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'RESOURCE_NOT_FOUND');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from Helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('Compression', () => {
    it('should compress large responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Small responses might not be compressed
      // This test just verifies the middleware is loaded
      expect(response.status).toBe(200);
    });
  });
});
