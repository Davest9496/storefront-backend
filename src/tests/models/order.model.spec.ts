import { OrderStore } from '../../../src/models/order.model';
import { UserStore } from '../../../src/models/user.model';
import { ProductStore } from '../../../src/models/product.model';
import {
  Product,
  User,
  Order,
  CreateUserDTO,
  CreateProductDTO,
  ProductCategory,
  OrderProductDetail,
} from '../../../src/types/shared.types';
import client from '../../../src/config/database.config';

// Extend Order interface for tests to include products
interface OrderWithProducts extends Order {
  products: OrderProductDetail[];
}

describe('Order Model', () => {
  const orderStore = new OrderStore();
  const userStore = new UserStore();
  const productStore = new ProductStore();

  let testUser: User;
  let testProduct: Product;
  let testOrder: OrderWithProducts;

  // Increase timeout for slower operations
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  beforeAll(async () => {
    try {
      // Clean up any existing test data first
      await cleanupTestData();

      // Create test user
      const userData: CreateUserDTO = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test.order@example.com', // Changed email to avoid conflicts
        password: 'password123',
      };
      testUser = await userStore.create(userData);

      if (!testUser.id) {
        throw new Error('Failed to create test user');
      }

      // Create test product
      const productData: CreateProductDTO = {
        product_name: 'Test Headphones',
        price: 299.99,
        category: 'headphones' as ProductCategory,
        product_desc: 'Test Description',
        image_name: 'test-headphones',
        product_features: ['Feature 1', 'Feature 2'],
        product_accessories: ['Accessory 1', 'Accessory 2'],
      };
      testProduct = await productStore.create(productData);

      if (!testProduct.id) {
        throw new Error('Failed to create test product');
      }
    } catch (err) {
      console.error('Error in beforeAll:', err);
      throw err;
    }
  });

  afterAll(async () => {
    try {
      await cleanupTestData();
    } catch (err) {
      console.error('Error in afterAll:', err);
    }
  });

  // Helper function to clean up test data
  async function cleanupTestData(): Promise<void> {
    try {
      const conn = await client.dbPool.connect();
      // Drop in reverse order of dependencies
      await conn.query('DELETE FROM order_products CASCADE');
      await conn.query('DELETE FROM orders CASCADE');
      await conn.query('DELETE FROM products CASCADE');
      await conn.query('DELETE FROM users CASCADE');
      conn.release();
    } catch (err) {
      console.error('Error in cleanupTestData:', err);
      throw err;
    }
  }

  it('should have all required methods', () => {
    expect(orderStore.create).toBeDefined();
    expect(orderStore.index).toBeDefined();
    expect(orderStore.show).toBeDefined();
    expect(orderStore.getCurrentOrder).toBeDefined();
    expect(orderStore.getCompletedOrders).toBeDefined();
    expect(orderStore.addProduct).toBeDefined();
    expect(orderStore.updateStatus).toBeDefined();
    expect(orderStore.delete).toBeDefined();
  });

  describe('Basic CRUD Operations', () => {
    it('should create a new order', async () => {
      try {
        if (!testUser.id) {
          throw new Error('Test user ID is undefined');
        }

        const newOrder = await orderStore.create(testUser.id);
        testOrder = { ...newOrder, products: [] };

        expect(testOrder).toBeDefined();
        expect(testOrder.user_id).toBe(testUser.id);
        expect(testOrder.status).toBe('active');
      } catch (err) {
        fail(`Failed to create order: ${err}`);
      }
    });

    it('should get all orders', async () => {
      try {
        const result = await orderStore.index();
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      } catch (err) {
        fail(`Failed to get orders: ${err}`);
      }
    });

    it('should get a specific order', async () => {
      try {
        if (!testOrder.id) {
          throw new Error('Test order ID is undefined');
        }

        const result = await orderStore.show(testOrder.id);
        expect(result).toBeDefined();
        expect(result?.id).toBe(testOrder.id);
        expect(result?.user_id).toBe(testUser.id);
      } catch (err) {
        fail(`Failed to get specific order: ${err}`);
      }
    });

    it('should get current order by user', async () => {
      try {
        if (!testUser.id) {
          throw new Error('Test user ID is undefined');
        }

        const result = await orderStore.getCurrentOrder(testUser.id);
        expect(result).toBeDefined();
        expect(result?.user_id).toBe(testUser.id);
        expect(result?.status).toBe('active');
      } catch (err) {
        fail(`Failed to get current order: ${err}`);
      }
    });
  });

  describe('Order Product Operations', () => {
    it('should add product to order', async () => {
      try {
        if (!testOrder.id || !testProduct.id) {
          throw new Error('Test order or product ID is undefined');
        }

        const result = await orderStore.addProduct(
          testOrder.id,
          testProduct.id,
          2
        );
        expect(result).toBeDefined();
        expect(result.order_id).toBe(testOrder.id);
        expect(result.product_id).toBe(testProduct.id);
        expect(result.quantity).toBe(2);
      } catch (err) {
        fail(`Failed to add product to order: ${err}`);
      }
    });

    it('should update product quantity', async () => {
      try {
        if (!testOrder.id || !testProduct.id) {
          throw new Error('Test order or product ID is undefined');
        }

        const result = await orderStore.updateProductQuantity(
          testOrder.id,
          testProduct.id,
          3
        );
        expect(result).toBeDefined();
        expect(result.quantity).toBe(3);
      } catch (err) {
        fail(`Failed to update product quantity: ${err}`);
      }
    });

    it('should remove product from order', async () => {
      try {
        if (!testOrder.id || !testProduct.id) {
          throw new Error('Test order or product ID is undefined');
        }

        await orderStore.removeProduct(testOrder.id, testProduct.id);
        const result = await orderStore.show(testOrder.id);

        if (!result) {
          throw new Error('Order not found after product removal');
        }

        const orderWithProducts = result as OrderWithProducts;
        const hasProduct = orderWithProducts.products?.some(
          (p) => p.product_id === testProduct.id
        );
        expect(hasProduct).toBe(false);
      } catch (err) {
        fail(`Failed to remove product from order: ${err}`);
      }
    });
  });

  describe('Order Status Operations', () => {
    it('should update order status', async () => {
      try {
        if (!testOrder.id) {
          throw new Error('Test order ID is undefined');
        }

        const result = await orderStore.updateStatus(testOrder.id, 'complete');
        expect(result).toBeDefined();
        expect(result.status).toBe('complete');
      } catch (err) {
        fail(`Failed to update order status: ${err}`);
      }
    });

    it('should get completed orders by user', async () => {
      try {
        if (!testUser.id) {
          throw new Error('Test user ID is undefined');
        }

        const result = await orderStore.getCompletedOrders(testUser.id);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].status).toBe('complete');
      } catch (err) {
        fail(`Failed to get completed orders: ${err}`);
      }
    });
  });

  describe('Delete Operations', () => {
    it('should delete an order', async () => {
      try {
        if (!testOrder.id) {
          throw new Error('Test order ID is undefined');
        }

        await orderStore.delete(testOrder.id);
        const result = await orderStore.show(testOrder.id);
        expect(result).toBeNull();
      } catch (err) {
        fail(`Failed to delete order: ${err}`);
      }
    });
  });
});
