import supertest from 'supertest';
import app from '../../server';
import { generateToken } from '../../middleware/auth.middleware';
import { ProductCategory } from '../../types/shared.types';

const request = supertest(app);

describe('Product Routes', () => {
  // Test data
  const testProduct = {
    product_name: 'Test Headphones',
    price: 199.99,
    category: 'headphones' as ProductCategory,
    product_desc: 'Test description',
    image_name: 'test-headphones',
    product_features: ['Feature 1', 'Feature 2'],
    product_accessories: ['Accessory 1', 'Accessory 2'],
  };

  let token: string;
  let createdProductId: number;

  beforeAll(async () => {
    // Generate test authentication token
    token = generateToken(1, 'test@example.com');
  });

  describe('Public Routes', () => {
    describe('GET /', () => {
      it('should return list of products', async () => {
        const response = await request.get('/api/products');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /search', () => {
      it('should search products by query', async () => {
        const response = await request
          .get('/api/products/search')
          .query({ q: 'headphones' });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should return empty array for no matches', async () => {
        const response = await request
          .get('/api/products/search')
          .query({ q: 'nonexistentproduct12345' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });

    describe('GET /popular', () => {
      it('should return popular products', async () => {
        const response = await request.get('/api/products/popular');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeLessThanOrEqual(5);
      });
    });

    describe('GET /category/:category', () => {
      beforeEach(async () => {
        // Create a test product for category testing
        await request
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send(testProduct);
      });

      afterEach(async () => {
        // Clean up test products
        await request
          .delete(`/api/products/${createdProductId}`)
          .set('Authorization', `Bearer ${token}`);
      });

      it('should return products by valid category', async () => {
        const response = await request.get('/api/products/category/headphones');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach((product: { category: string }) => {
          expect(product.category).toBe('headphones');
        });
      });

      it('should return empty array for invalid category', async () => {
        const response = await request.get(
          '/api/products/category/invalidcategory'
        );

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });

      it('should return empty array for valid category with no products', async () => {
        const response = await request.get('/api/products/category/speakers');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });

    describe('GET /:id', () => {
      it('should return product by id', async () => {
        // First create a product to test with
        const createResponse = await request
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send(testProduct);

        createdProductId = createResponse.body.id;

        const response = await request.get(`/api/products/${createdProductId}`);

        expect(response.status).toBe(200);
        expect(response.body.product_name).toBe(testProduct.product_name);
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request.get('/api/products/999999');
        expect(response.status).toBe(404);
      });
    });
  });

  describe('Protected Routes', () => {
    describe('POST /', () => {
      it('should create new product with valid token', async () => {
        const response = await request
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send(testProduct);

        expect(response.status).toBe(201);
        expect(response.body.product_name).toBe(testProduct.product_name);
      });

      it('should return 401 without token', async () => {
        const response = await request.post('/api/products').send(testProduct);

        expect(response.status).toBe(401);
      });

      it('should return 400 with invalid product data', async () => {
        const invalidProduct = {
          // Missing required fields
          product_name: 'Test Product',
        };

        const response = await request
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send(invalidProduct);

        expect(response.status).toBe(400);
      });
    });

    describe('PUT /:id', () => {
      it('should update product with valid token', async () => {
        const updates = {
          product_name: 'Updated Test Headphones',
          price: 299.99,
        };

        const response = await request
          .put(`/api/products/${createdProductId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updates);

        expect(response.status).toBe(200);
        expect(response.body.product_name).toBe(updates.product_name);
        expect(parseFloat(response.body.price)).toBe(updates.price);
      });

      it('should return 401 without token', async () => {
        const response = await request
          .put(`/api/products/${createdProductId}`)
          .send({ product_name: 'Updated Name' });

        expect(response.status).toBe(401);
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request
          .put('/api/products/999999')
          .set('Authorization', `Bearer ${token}`)
          .send({ product_name: 'Updated Name' });

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /:id', () => {
      it('should delete product with valid token', async () => {
        const response = await request
          .delete(`/api/products/${createdProductId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);

        // Verify product is deleted
        const getResponse = await request.get(
          `/api/products/${createdProductId}`
        );
        expect(getResponse.status).toBe(404);
      });

      it('should return 401 without token', async () => {
        const response = await request.delete(
          `/api/products/${createdProductId}`
        );

        expect(response.status).toBe(401);
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request
          .delete('/api/products/999999')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });
  });
});
