// import supertest from 'supertest';
// import app from '../../server';
// import { generateToken } from '../../middleware/auth.middleware';
// import client from '../../config/database.config';
// import { CreateUserDTO, CreateProductDTO } from '../../types';

// const request = supertest(app);

// describe('Order Endpoints', () => {
//   let token: string;
//   let userId: number;
//   let orderId: number;
//   let productId: number;

//   beforeAll(async () => {
//     // Clean up any existing test data
//     const conn = await client.connect();
//     try {
//       await conn.query('BEGIN');
//       await conn.query('DELETE FROM order_products CASCADE');
//       await conn.query('DELETE FROM orders CASCADE');
//       await conn.query('DELETE FROM products WHERE product_name = $1', [
//         'Test Headphones',
//       ]);
//       await conn.query('DELETE FROM users WHERE email = $1', [
//         'test.order@example.com',
//       ]);
//       await conn.query('COMMIT');
//     } catch (error) {
//       await conn.query('ROLLBACK');
//       throw error;
//     } finally {
//       conn.release();
//     }

//     // Create test user
//     const userData: CreateUserDTO = {
//       email: 'test.order@example.com',
//       password: 'password123',
//       first_name: 'Test',
//       last_name: 'Order',
//     };

//     const userResponse = await request.post('/api/users').send(userData);

//     userId = userResponse.body.id;
//     token = generateToken(userId, userData.email);

//     // Create test product
//     const productData: CreateProductDTO = {
//       product_name: 'Test Headphones',
//       price: 299.99,
//       category: 'headphones',
//       image_name: 'test-headphones',
//       product_features: ['Feature 1', 'Feature 2'],
//       product_accessories: ['Accessory 1', 'Accessory 2'],
//     };

//     const productResponse = await request
//       .post('/api/products')
//       .set('Authorization', `Bearer ${token}`)
//       .send(productData);

//     productId = productResponse.body.id;
//   });

//   afterAll(async () => {
//     const conn = await client.connect();
//     try {
//       await conn.query('BEGIN');
//       await conn.query('DELETE FROM order_products CASCADE');
//       await conn.query('DELETE FROM orders CASCADE');
//       await conn.query('DELETE FROM products WHERE product_name = $1', [
//         'Test Headphones',
//       ]);
//       await conn.query('DELETE FROM users WHERE email = $1', [
//         'test.order@example.com',
//       ]);
//       await conn.query('COMMIT');
//     } catch (error) {
//       await conn.query('ROLLBACK');
//       throw error;
//     } finally {
//       conn.release();
//     }
//   });

//   describe('Order Creation and Management', () => {
//     it('creates a new order with valid token', async () => {
//       const response = await request
//         .post('/api/orders')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(201);
//       expect(response.body.user_id).toBe(userId);
//       expect(response.body.status).toBe('active');

//       // Store the order ID for subsequent tests
//       orderId = response.body.id;
//     });

//     it('adds product to order', async () => {
//       const response = await request
//         .post(`/api/orders/${orderId}/products`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           product_id: productId,
//           quantity: 2,
//         });

//       expect(response.status).toBe(201);
//       expect(response.body.order_id).toBe(orderId);
//       expect(response.body.product_id).toBe(productId);
//       expect(response.body.quantity).toBe(2);
//     });

//     it('gets current order for user', async () => {
//       const response = await request
//         .get(`/api/orders/current/${userId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.id).toBe(orderId);
//       expect(response.body.status).toBe('active');
//       expect(response.body.user_id).toBe(userId);
//     });

//     it('completes an order', async () => {
//       const response = await request
//         .put(`/api/orders/${orderId}/complete`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.id).toBe(orderId);
//       expect(response.body.status).toBe('complete');
//     });

//     it('gets completed orders for user', async () => {
//       const response = await request
//         .get(`/api/orders/completed/${userId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBeTruthy();
//       expect(response.body.length).toBeGreaterThan(0);
//       expect(response.body[0].status).toBe('complete');
//       expect(response.body[0].id).toBe(orderId);
//     });
//   });

//   describe('Order Security', () => {
//     it('prevents order creation without token', async () => {
//       const response = await request.post('/api/orders');
//       expect(response.status).toBe(401);
//     });

//     it('prevents access to orders of other users', async () => {
//       const otherToken = generateToken(999, 'other@example.com');
//       const response = await request
//         .get(`/api/orders/current/${userId}`)
//         .set('Authorization', `Bearer ${otherToken}`);

//       expect(response.status).toBe(403);
//     });

//     it('validates product quantity when adding to order', async () => {
//       const response = await request
//         .post(`/api/orders/${orderId}/products`)
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           product_id: productId,
//           quantity: 0,
//         });

//       expect(response.status).toBe(400);
//     });
//   });
// });
