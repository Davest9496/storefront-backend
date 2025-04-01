// import { OrderStore } from '../../models/order.model';
// import { UserStore } from '../../models/user.model';
// import { ProductStore } from '../../models/product.model';
// import {
//   Order,
//   User,
//   Product,
//   CreateUserDTO,
//   CreateProductDTO,
//   ProductCategory,
// } from '../../types/shared.types';
// import { Pool } from 'pg';
// import dbClient from '../../config/database.config';

// describe('Order Model', () => {
//   const orderStore = new OrderStore();
//   const userStore = new UserStore();
//   const productStore = new ProductStore();

//   let testUser: User & { id: number };
//   let testProduct: Product;
//   let testOrder: Order & { id: number };
//   let client: Pool;

//   beforeAll(async () => {
//     client = dbClient.dbPool;

//     // Create test user
//     const userData: CreateUserDTO = {
//       first_name: 'Test',
//       last_name: 'User',
//       email: 'test@example.com',
//       password: 'password123',
//     };
//     const user = await userStore.create(userData);
//     if (!user.id) throw new Error('Failed to create test user');
//     testUser = { ...user, id: user.id }; // Ensure id is non-null

//     // Create test product
//     const productData: CreateProductDTO = {
//       product_name: 'Test Headphones',
//       price: 299.99,
//       category: 'headphones' as ProductCategory,
//       product_desc: 'Test description',
//       image_name: 'test-headphones',
//       product_features: ['Feature 1', 'Feature 2'],
//       product_accessories: ['Accessory 1', 'Accessory 2'],
//     };
//     const product = await productStore.create(productData);
//     if (!product.id) throw new Error('Failed to create test product');
//     testProduct = product; // Ensure id is non-null
//   });

//   afterAll(async () => {
//     // Clean up test data
//     try {
//       const connection = await client.connect();
//       await connection.query('DELETE FROM order_products');
//       await connection.query('DELETE FROM orders');
//       await connection.query('DELETE FROM products');
//       await connection.query('DELETE FROM users');
//       connection.release();
//     } catch (err) {
//       console.error('Error cleaning up test data:', err);
//     }
//   });

//   describe('Method existence', () => {
//     it('should have a create method', () => {
//       expect(orderStore.create).toBeDefined();
//     });

//     it('should have an index method', () => {
//       expect(orderStore.index).toBeDefined();
//     });

//     it('should have a show method', () => {
//       expect(orderStore.show).toBeDefined();
//     });

//     it('should have a delete method', () => {
//       expect(orderStore.delete).toBeDefined();
//     });
//   });

//   describe('CRUD Operations', () => {
//     it('create method should add a new order', async () => {
//       const order = await orderStore.create(testUser.id);
//       if (!order.id) throw new Error('Failed to create test order');
//       testOrder = { ...order, id: order.id }; // Ensure id is non-null

//       expect(testOrder).toBeDefined();
//       expect(testOrder.user_id).toBe(testUser.id);
//       expect(testOrder.status).toBe('active');
//     });

//     it('index method should return a list of orders', async () => {
//       const result = await orderStore.index();
//       expect(result).toBeDefined();
//       expect(Array.isArray(result)).toBe(true);
//       expect(result.length).toBeGreaterThan(0);
//     });

//     it('show method should return the correct order', async () => {
//       const result = await orderStore.show(testOrder.id);
//       expect(result).toBeDefined();
//       expect(result?.id).toBe(testOrder.id);
//       expect(result?.user_id).toBe(testUser.id);
//     });

//     it('should return null for non-existent order', async () => {
//       const result = await orderStore.show(999999);
//       expect(result).toBeNull();
//     });
//   });

//   describe('Order Products Operations', () => {
//     it('should add a product to an order', async () => {
//       const quantity = 2;
//       const result = await orderStore.addProduct(
//         testOrder.id,
//         testProduct.id,
//         quantity
//       );

//       expect(result).toBeDefined();
//       expect(result.order_id).toBe(testOrder.id);
//       expect(result.product_id).toBe(testProduct.id);
//       expect(result.quantity).toBe(quantity);
//     });

//     it('should not add product to completed order', async () => {
//       // First complete the order
//       await orderStore.updateStatus(testOrder.id, 'complete');

//       await expectAsync(
//         orderStore.addProduct(testOrder.id, testProduct.id, 1)
//       ).toBeRejectedWithError(
//         `Could not add product ${testProduct.id} to order ${testOrder.id}. Error: Cannot add products to completed order ${testOrder.id}`
//       );
//     });
//   });

//   describe('Order Status Operations', () => {
//     it('should update order status', async () => {
//       const result = await orderStore.updateStatus(testOrder.id, 'complete');
//       expect(result).toBeDefined();
//       expect(result.status).toBe('complete');
//     });

//     it('should get current order for user', async () => {
//       // Create a new active order since previous one was completed
//       await orderStore.create(testUser.id);
//       const result = await orderStore.getCurrentOrder(testUser.id);

//       expect(result).toBeDefined();
//       expect(result?.status).toBe('active');
//       expect(result?.user_id).toBe(testUser.id);
//     });

//     it('should get completed orders for user', async () => {
//       const result = await orderStore.getCompletedOrders(testUser.id);

//       expect(Array.isArray(result)).toBe(true);
//       expect(result.length).toBeGreaterThan(0);
//       expect(result[0].status).toBe('complete');
//     });
//   });

//   describe('Error Handling', () => {
//     it('should handle missing order gracefully', async () => {
//       await expectAsync(orderStore.delete(999999)).toBeRejectedWithError(
//         'Could not delete order 999999. Error: Order 999999 not found'
//       );
//     });

//     it('should handle invalid product ID', async () => {
//       await expectAsync(
//         orderStore.addProduct(testOrder.id, 999999, 1)
//       ).toBeRejected();
//     });

//     it('should handle invalid quantities', async () => {
//       await expectAsync(
//         orderStore.addProduct(testOrder.id, testProduct.id, -1)
//       ).toBeRejected();
//     });
//   });
// });
