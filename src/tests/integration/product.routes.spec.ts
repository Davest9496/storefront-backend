// import supertest from 'supertest';
// import app from '../../server';
// import { generateToken } from '../../middleware/auth.middleware';
// import client from '../../config/database.config';

// const request = supertest(app);

// describe('Product API Endpoints', () => {
//   let authToken: string;
//   const testUserId = 1;
//   const testUserEmail = 'test@example.com';

//   // Sample test product data
//   const testProduct = {
//     product_name: 'Test Headphones',
//     price: 199.99,
//     category: 'headphones',
//     product_desc: 'Test description',
//     image_name: 'test-headphones',
//     product_features: ['Feature 1', 'Feature 2'],
//     product_accessories: ['Manual', 'Cable'],
//   };

//   beforeAll(async () => {
//     // Generate auth token for protected routes
//     authToken = generateToken(testUserId, testUserEmail);

//     // Clear test data from previous runs
//     const conn = await client.connect();
//     try {
//       await conn.query("DELETE FROM products WHERE product_name LIKE 'Test%'");
//     } catch (error) {
//       console.error('Error cleaning test data:', error);
//     } finally {
//       conn.release();
//     }
//   });

//   describe('GET /api/products', () => {
//     it('should return a list of products', async () => {
//       const response = await request.get('/api/products');

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBe(true);
//     });
//   });

//   describe('POST /api/products', () => {
//     it('should require authentication', async () => {
//       const response = await request.post('/api/products').send(testProduct);

//       expect(response.status).toBe(401);
//     });

//     it('should create a new product with valid token', async () => {
//       const response = await request
//         .post('/api/products')
//         .set('Authorization', `Bearer ${authToken}`)
//         .send(testProduct);

//       expect(response.status).toBe(201);
//       expect(response.body.product_name).toBe(testProduct.product_name);
//       expect(response.body.price).toBe(testProduct.price);
//       expect(response.body.id).toBeDefined();
//     });

//     it('should validate required fields', async () => {
//       const invalidProduct = {
//         product_name: 'Invalid Product',
//         // Missing required fields
//       };

//       const response = await request
//         .post('/api/products')
//         .set('Authorization', `Bearer ${authToken}`)
//         .send(invalidProduct);

//       expect(response.status).toBe(400);
//     });
//   });

//   describe('GET /api/products/:id', () => {
//     it('should return a specific product', async () => {
//       // First, create a product to test with
//       const createResponse = await request
//         .post('/api/products')
//         .set('Authorization', `Bearer ${authToken}`)
//         .send(testProduct);

//       const productId = createResponse.body.id;

//       const response = await request.get(`/api/products/${productId}`);

//       expect(response.status).toBe(200);
//       expect(response.body.id).toBe(productId);
//       expect(response.body.product_name).toBe(testProduct.product_name);
//     });

//     it('should return 404 for non-existent product', async () => {
//       const response = await request.get('/api/products/99999');
//       expect(response.status).toBe(404);
//     });
//   });

//   describe('GET /api/products/category/:category', () => {
//     it('should return products by category', async () => {
//       const response = await request.get('/api/products/category/headphones');

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBe(true);
//     });

//     it('should validate category parameter', async () => {
//       const response = await request.get('/api/products/category/invalid');

//       expect(response.status).toBe(400);
//     });
//   });

//   describe('GET /api/products/popular', () => {
//     it('should return popular products', async () => {
//       const response = await request.get('/api/products/popular');

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBe(true);
//       expect(response.body.length).toBeLessThanOrEqual(5);
//     });
//   });
// });
