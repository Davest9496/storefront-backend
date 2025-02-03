import supertest from 'supertest';
import app from '../../../src/server';
import { UserStore } from '../../../src/models/user.model';
import { ProductStore } from '../../../src/models/product.model';
import { OrderStore } from '../../../src/models/order.model';
import client from '../../../src/config/database.config';
import { generateToken } from '../../../src/middleware/auth.middleware';
import { User, Product, Order } from '../../../src/types/shared.types';

const request = supertest(app);
const userStore = new UserStore();
const productStore = new ProductStore();
const orderStore = new OrderStore();

describe('Order Routes', () => {
  let testUser: User;
  let testProduct: Product;
  let testOrder: Order;
  let token: string;

  beforeAll(async () => {
    // Create test user
    testUser = await userStore.create({
      first_name: 'Test',
      last_name: 'User',
      email: 'test.order@example.com',
      password: 'password123',
    });

    // Generate token for test user
    token = generateToken(testUser.id as number, testUser.email);

    // Create test product
    testProduct = await productStore.create({
      product_name: 'Test Product',
      price: 99.99,
      category: 'headphones',
      image_name: 'test-product.jpg',
      product_features: ['Feature 1', 'Feature 2'],
      product_accessories: ['Accessory 1', 'Accessory 2'],
    });

    // Create test order
    testOrder = await orderStore.create(testUser.id as number);

    // Add test product to order
    await orderStore.addProduct(
      testOrder.id as number,
      testProduct.id as number,
      2
    );
  });

  afterAll(async () => {
    // Clean up test data
    const conn = await client.dbPool.connect();
    await conn.query('DELETE FROM order_products');
    await conn.query('DELETE FROM orders');
    await conn.query('DELETE FROM products');
    await conn.query('DELETE FROM users');
    conn.release();
  });

  describe('GET /orders', () => {
    it('should require authentication', async () => {
      const response = await request.get('/api/orders');
      expect(response.status).toBe(401);
    });

    it('should return all orders when authenticated', async () => {
      const response = await request
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verify order contains product information
      if (response.body.length > 0) {
        const order = response.body.find((o: Order) => o.id === testOrder.id);
        expect(order).toBeDefined();
      }
    });
  });

  describe('GET /orders/:id', () => {
    it('should require authentication', async () => {
      const response = await request.get(`/api/orders/${testOrder.id}`);
      expect(response.status).toBe(401);
    });

    it('should return the specified order when authenticated', async () => {
      const response = await request
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testOrder.id);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /orders', () => {
    it('should require authentication', async () => {
      const response = await request.post('/api/orders');
      expect(response.status).toBe(401);
    });

    it('should create a new order when authenticated', async () => {
      const response = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.user_id).toBe(testUser.id);
      expect(response.body.status).toBe('active');
    });

    it('should allow adding products to the new order', async () => {
      // First create a new order
      const orderResponse = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(orderResponse.status).toBe(201);
      const orderId = orderResponse.body.id;

      // Then add product to it
      const addProductResponse = await request
        .post(`/api/orders/${orderId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: testProduct.id,
          quantity: 1,
        });

      expect(addProductResponse.status).toBe(200);
      expect(addProductResponse.body.order_id).toBe(orderId);
      expect(addProductResponse.body.product_id).toBe(testProduct.id);
      expect(addProductResponse.body.quantity).toBe(1);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should require authentication', async () => {
      const response = await request
        .patch(`/api/orders/${testOrder.id}/status`)
        .send({ status: 'complete' });

      expect(response.status).toBe(401);
    });

    it('should update order status when authenticated', async () => {
      const response = await request
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'complete' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('complete');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /orders/:id', () => {
    let orderToDelete: Order;

    beforeEach(async () => {
      orderToDelete = await orderStore.create(testUser.id as number);
      await orderStore.addProduct(
        orderToDelete.id as number,
        testProduct.id as number,
        1
      );
    });

    it('should require authentication', async () => {
      const response = await request.delete(`/api/orders/${orderToDelete.id}`);
      expect(response.status).toBe(401);
    });

    it('should delete the specified order and its products when authenticated', async () => {
      const response = await request
        .delete(`/api/orders/${orderToDelete.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order deleted successfully');

      // Verify order was deleted
      const checkOrder = await orderStore.show(orderToDelete.id as number);
      expect(checkOrder).toBeNull();
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request
        .delete('/api/orders/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /orders/user/:userId/current', () => {
    it('should require authentication', async () => {
      const response = await request.get(
        `/api/orders/user/${testUser.id}/current`
      );
      expect(response.status).toBe(401);
    });

    it('should return current order for authorized user', async () => {
      const response = await request
        .get(`/api/orders/user/${testUser.id}/current`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      if (response.body.message !== 'No active order found') {
        expect(response.body.status).toBe('active');
        expect(response.body.user_id).toBe(testUser.id);
      }
    });

    it("should not allow access to other user's current order", async () => {
      const response = await request
        .get('/api/orders/user/99999/current')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /orders/user/:userId/completed', () => {
    beforeAll(async () => {
      // Create a completed order for test user
      const completedOrder = await orderStore.create(testUser.id as number);
      await orderStore.addProduct(
        completedOrder.id as number,
        testProduct.id as number,
        1
      );
      await orderStore.updateStatus(completedOrder.id as number, 'complete');
    });

    it('should require authentication', async () => {
      const response = await request.get(
        `/api/orders/user/${testUser.id}/completed`
      );
      expect(response.status).toBe(401);
    });

    it('should return completed orders for authorized user', async () => {
      const response = await request
        .get(`/api/orders/user/${testUser.id}/completed`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const order = response.body[0];
        expect(order.status).toBe('complete');
        expect(order.user_id).toBe(testUser.id);
      }
    });

    it("should not allow access to other user's completed orders", async () => {
      const response = await request
        .get('/api/orders/user/99999/completed')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /orders', () => {
    it('should require authentication', async () => {
      const response = await request.post('/api/orders');
      expect(response.status).toBe(401);
    });

    it('should create a new order when authenticated', async () => {
      const response = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.user_id).toBe(testUser.id);
      expect(response.body.status).toBe('active');
    });

    it('should allow adding products to the new order', async () => {
      // First create a new order
      const orderResponse = await request
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(orderResponse.status).toBe(201);
      const orderId = orderResponse.body.id;

      // Then add product to it
      const addProductResponse = await request
        .post(`/api/orders/${orderId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: testProduct.id,
          quantity: 1,
        });

      expect(addProductResponse.status).toBe(200);
      expect(addProductResponse.body).toBeDefined();
      expect(typeof addProductResponse.body.id).toBe('number');
      expect(addProductResponse.body.order_id).toBe(orderId);
      expect(addProductResponse.body.product_id).toBe(testProduct.id);
      expect(addProductResponse.body.quantity).toBe(1);
    });
  });
});
