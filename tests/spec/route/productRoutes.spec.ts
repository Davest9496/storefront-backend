import request from 'supertest';
import express from 'express';
import productRouter from '../../../src/routes/api/productRoutes';
import { PoolClient } from 'pg';

describe('Product Routes Integration Tests', () => {
  let app: express.Application;
  let mockClient: Partial<PoolClient>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productRouter);

    mockClient = {
      query: jasmine.createSpy('query'),
      release: jasmine.createSpy('release'),
    };

    const mockPool = {
      connect: () => Promise.resolve(mockClient),
    };

    spyOn(
      require('../../../src/config/db.config'),
      'createPool'
    ).and.returnValue(mockPool);
  });

  beforeEach(() => {
    (mockClient.query as jasmine.Spy).calls.reset();
  });

  describe('GET /:id', () => {
    it('should return a product by ID', async () => {
      const mockProduct = {
        rows: [
          {
            id: 1,
            product_name: 'Test Product',
            price: 99.99,
            category: 'headphones',
          },
        ],
      };
      (mockClient.query as jasmine.Spy).and.returnValue(
        Promise.resolve(mockProduct)
      );

      const response = await request(app).get('/api/products/1');
      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      (mockClient.query as jasmine.Spy).and.returnValue(
        Promise.resolve({ rows: [] })
      );

      const response = await request(app).get('/api/products/999');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /popular', () => {
    it('should return popular products', async () => {
      const mockProducts = {
        rows: [
          {
            id: 1,
            product_name: 'Test Product',
            price: 99.99,
            category: 'headphones',
          },
        ],
      };
      (mockClient.query as jasmine.Spy).and.returnValue(
        Promise.resolve(mockProducts)
      );

      const response = await request(app).get('/api/products/popular');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /category/:category', () => {
    it('should return products by category', async () => {
      const mockProducts = {
        rows: [
          {
            id: 1,
            product_name: 'Test Product',
            price: 99.99,
            category: 'headphones',
          },
        ],
      };
      (mockClient.query as jasmine.Spy).and.returnValue(
        Promise.resolve(mockProducts)
      );

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
