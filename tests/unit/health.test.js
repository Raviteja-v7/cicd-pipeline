const request = require('supertest');
const app = require('../../src/app');

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const res = await request(app).get('/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });
  });

  describe('GET /info', () => {
    it('should return system info in non-production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const res = await request(app).get('/info');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hostname');
      expect(res.body).toHaveProperty('platform');
      expect(res.body).toHaveProperty('nodeVersion');

      process.env.NODE_ENV = originalEnv;
    });

    it('should block system info in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const res = await request(app).get('/info');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Not available in production');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('CI/CD Pipeline');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404', async () => {
      const res = await request(app).get('/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Route not found');
    });
  });
});
