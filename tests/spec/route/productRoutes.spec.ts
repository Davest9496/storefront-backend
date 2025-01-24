import request from 'supertest';
import express from 'express';
import { productRouter } from '../../../src/routes/api/productRoutes';

describe('Product Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productRouter);
  });

  describe('GET /', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('should return a product by ID', async () => {
      const response = await request(app).get('/api/products/1');
      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /popular', () => {
    it('should return popular products', async () => {
      const response = await request(app).get('/api/products/popular');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /category/:category', () => {
    it('should return products by category', async () => {
      const response = await request(app).get(
        '/api/products/category/headphones'
      );
      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).get('/api/products/category/invalid');
      expect(response.status).toBe(400);
    });
  });

  describe('POST /', () => {
    it('should require authentication', async () => {
      const response = await request(app).post('/api/products').send({
        product_name: 'Test Product',
        price: 99.99,
        category: 'headphones',
      });
      expect(response.status).toBe(401);
    });
  });
});
