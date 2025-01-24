import express from 'express';
import request from 'supertest';
import router from '../../../src/routes/router';
import { closePool } from '../../helpers/database';

describe('Router Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
  });

  afterAll(async () => {
    await closePool();
  });

  describe('User Routes', () => {
    it('should mount user routes at /api/users', async () => {
      await request(app).get('/api/users').expect(401);
    });
  });

  describe('Auth Routes', () => {
    it('should mount auth routes at /api/auth', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('Product Routes', () => {
    it('should mount product routes at /api/products', async () => {
      await request(app).get('/api/products').expect(200);
    });

    it('should require auth for protected product routes', async () => {
      await request(app)
        .post('/api/products')
        .send({
          product_name: 'Test Product',
          price: 99.99,
          category: 'headphones',
        })
        .expect(401);
    });
  });

  describe('Non-existent Routes', () => {
    it('should return 404 for undefined routes', async () => {
      await request(app).get('/api/nonexistent').expect(404);
    });
  });
});
