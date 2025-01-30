// import { OrderStore } from '../../models/order.model';
// import { testDb } from '../helpers/database';
// import { TestHelper } from '../helpers/test-helper';
// import { CreateOrderDTO } from '../types';

// describe('Order Store', () => {
//   // Initialize stores and test helper
//   const store = new OrderStore(testDb);
//   const testHelper = TestHelper.getInstance(testDb);

//   // Test data used throughout tests
//   let userId: number;
//   let productId: number;

//   // Set up base test data before each test
//   beforeEach(async () => {
//     // Start with a clean database state
//     await testHelper.cleanTables();

//     // Create test user and product that is needed for orders
//     userId = await testHelper.createTestUser(
//       'John',
//       'Doe',
//       'john.doe@test.com',
//       'password123'
//     );

//     productId = await testHelper.createTestProduct(
//       'Test Headphones',
//       299.99,
//       'headphones'
//     );
//   });

//   describe('Basic Order Operations', () => {
//     describe('create method', () => {
//       it('should create a new order with active status', async () => {
//         const orderData: CreateOrderDTO = {
//           user_id: userId,
//           status: 'active',
//         };

//         const result = await store.create(orderData);

//         // Verify the created order has all required properties
//         expect(result).toBeDefined();
//         expect(result.id).toBeDefined();
//         expect(result.user_id).toBe(userId);
//         expect(result.status).toBe('active');
//       });

//       it('should default to active status if not specified', async () => {
//         const orderData: CreateOrderDTO = {
//           user_id: userId,
//         };

//         const result = await store.create(orderData);
//         expect(result.status).toBe('active');
//       });

//       it('should reject order creation for non-existent user', async () => {
//         const nonExistentUserId = 999;
//         const orderData: CreateOrderDTO = {
//           user_id: nonExistentUserId,
//           status: 'active',
//         };

//         await expectAsync(store.create(orderData)).toBeRejectedWithError(
//           /violates foreign key constraint/
//         );
//       });
//     });

//     describe('getCurrentOrder method', () => {
//       it('should return null when user has no active order', async () => {
//         const result = await store.getCurrentOrder(userId);
//         expect(result).toBeNull();
//       });

//       it('should return only active order when user has multiple orders', async () => {
//         // Create an active order
//         const activeOrderId = await testHelper.createTestOrder(
//           userId,
//           'active'
//         );

//         // Create a completed order to ensure it's not returned
//         await testHelper.createTestOrder(userId, 'complete');

//         const currentOrder = await store.getCurrentOrder(userId);

//         expect(currentOrder).toBeDefined();
//         expect(currentOrder?.id).toBe(activeOrderId);
//         expect(currentOrder?.status).toBe('active');
//       });
//     });
//   });

//   describe('Order Product Operations', () => {
//     describe('addProduct method', () => {
//       it('should add product to active order successfully', async () => {
//         const activeOrderId = await testHelper.createTestOrder(
//           userId,
//           'active'
//         );
//         const quantity = 2;

//         const result = await store.addProduct({
//           order_id: activeOrderId,
//           product_id: productId,
//           quantity,
//         });

//         expect(result).toBeDefined();
//         expect(result.order_id).toBe(activeOrderId);
//         expect(result.product_id).toBe(productId);
//         expect(result.quantity).toBe(quantity);
//       });

//       it('should reject adding product to non-existent order', async () => {
//         const nonExistentOrderId = 999;

//         await expectAsync(
//           store.addProduct({
//             order_id: nonExistentOrderId,
//             product_id: productId,
//             quantity: 1,
//           })
//         ).toBeRejectedWithError(/Order 999 not found/);
//       });

//       it('should reject adding non-existent product', async () => {
//         const activeOrderId = await testHelper.createTestOrder(
//           userId,
//           'active'
//         );
//         const nonExistentProductId = 999;

//         await expectAsync(
//           store.addProduct({
//             order_id: activeOrderId,
//             product_id: nonExistentProductId,
//             quantity: 1,
//           })
//         ).toBeRejectedWithError(/violates foreign key constraint/);
//       });
//     });

//     describe('getRecentOrders method', () => {
//       it('should return empty array for user with no orders', async () => {
//         const newUserId = await testHelper.createTestUser(
//           'Jane',
//           'Smith',
//           'jane@test.com'
//         );

//         const orders = await store.getRecentOrders(newUserId);
//         expect(orders).toEqual([]);
//       });

//       it('should return at most 5 orders with products', async () => {
//         // Create 7 orders with products to test limit
//         const orderCount = 7;
//         for (let i = 0; i < orderCount; i++) {
//           const orderId = await testHelper.createTestOrder(userId);
//           await testHelper.addProductToOrder(orderId, productId, i + 1);
//         }

//         const recentOrders = await store.getRecentOrders(userId);

//         expect(recentOrders.length).toBeLessThanOrEqual(5);
//         recentOrders.forEach((order) => {
//           expect(order.id).toBeDefined();
//           expect(order.status).toBeDefined();
//           expect(Array.isArray(order.products)).toBe(true);
//           expect(order.products.length).toBeGreaterThan(0);
//         });
//       });
//     });
//   });

//   describe('Order Status Operations', () => {
//     describe('completeOrder method', () => {
//       it('should complete an active order', async () => {
//         const activeOrderId = await testHelper.createTestOrder(
//           userId,
//           'active'
//         );
//         await testHelper.addProductToOrder(activeOrderId, productId, 1);

//         const completedOrder = await store.completeOrder(activeOrderId, userId);

//         expect(completedOrder.status).toBe('complete');
//         expect(completedOrder.id).toBe(activeOrderId);
//       });

//       it('should reject completing already completed order', async () => {
//         const orderId = await testHelper.createTestOrder(userId, 'active');

//         // Complete the order first
//         await store.completeOrder(orderId, userId);

//         // Try to complete it again
//         await expectAsync(
//           store.completeOrder(orderId, userId)
//         ).toBeRejectedWithError(/Could not complete order/);
//       });

//       it('should reject completing order of different user', async () => {
//         const activeOrderId = await testHelper.createTestOrder(
//           userId,
//           'active'
//         );

//         const otherUserId = await testHelper.createTestUser(
//           'Other',
//           'User',
//           'other@test.com'
//         );

//         await expectAsync(
//           store.completeOrder(activeOrderId, otherUserId)
//         ).toBeRejectedWithError(/Could not complete order/);
//       });
//     });
//   });
// });
