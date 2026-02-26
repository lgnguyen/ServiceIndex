import request from 'supertest';
import app from './app';

describe('Express app', () => {
  describe('GET /health', () => {
    it('returns 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /', () => {
    it('returns 200 and hello world data', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: 'Hello World!' });
    });
  });
});
