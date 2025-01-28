import request from 'supertest';
import app from '../../../src/server';
import TestDb from '../../helpers/testDb';
import { AuthService } from '../../../src/services/auth.service';
import { ProductCategory } from '../../../src/types/product.types';
import { PoolClient } from 'pg';

interface TestProduct {
  id: number;
  product_name: string;
  price: number;
  category: ProductCategory;
  product_desc?: string;
  features?: string[];
  accessories?: Array<{
    item_name: string;
    quantity: number;
  }>;
}

describe('Product Routes Integration Tests', () => {
  let authToken: string;
  let testProductId: number;
  let client: PoolClient;

  // Test data
  const testUser = {
    first_name: 'Product',
    last_name: 'Tester',
    email: 'product.test@example.com',
    password: 'TestPass123!',
  };

  const testProduct = {
    product_name: 'Test Headphones X1',
    price: 299.99,
    category: 'headphones' as unknown as ProductCategory,
    product_desc: 'Premium test headphones',
    features: ['Noise cancelling', 'Bluetooth 5.0'],
  };

  const testAccessories = [
    { item_name: 'Carrying case', quantity: 1 },
    { item_name: 'Charging cable', quantity: 1 },
  ];

  beforeAll(async () => {
    client = await TestDb.getClient();
    try {
      await client.query('BEGIN');

      // Clean existing test data
      await client.query(
        'DELETE FROM product_accessories WHERE product_id IN (SELECT id FROM products WHERE product_name = $1)',
        [testProduct.product_name]
      );
      await client.query('DELETE FROM products WHERE product_name = $1', [
        testProduct.product_name,
      ]);
      await client.query('DELETE FROM users WHERE email = $1', [
        testUser.email,
      ]);

      // Create test user
      const hashedPassword = await AuthService.hashPassword(testUser.password);
      const userResult = await client.query(
        'INSERT INTO users (first_name, last_name, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id',
        [
          testUser.first_name,
          testUser.last_name,
          testUser.email,
          hashedPassword,
        ]
      );

      // Create test product
      const productResult = await client.query(
        `INSERT INTO products 
        (product_name, price, category, product_desc, features) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
        [
          testProduct.product_name,
          testProduct.price,
          testProduct.category,
          testProduct.product_desc,
          testProduct.features,
        ]
      );
      testProductId = productResult.rows[0].id;

      // Add accessories
      for (const accessory of testAccessories) {
        await client.query(
          'INSERT INTO product_accessories (product_id, item_name, quantity) VALUES ($1, $2, $3)',
          [testProductId, accessory.item_name, accessory.quantity]
        );
      }

      await client.query('COMMIT');

      // Generate auth token
      authToken = AuthService.generateToken({
        id: userResult.rows[0].id,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await client.query('BEGIN');

      // Clean up in correct order due to foreign key constraints
      await client.query(
        'DELETE FROM product_accessories WHERE product_id IN (SELECT id FROM products WHERE product_name = $1)',
        [testProduct.product_name]
      );
      await client.query('DELETE FROM products WHERE product_name = $1', [
        testProduct.product_name,
      ]);
      await client.query('DELETE FROM users WHERE email = $1', [
        testUser.email,
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });

  describe('POST /', () => {
    const newProduct = {
      product_name: 'New Test Product',
      price: 199.99,
      category: 'speakers' as unknown as ProductCategory,
      product_desc: 'New test product description',
      features: ['Feature 1', 'Feature 2'],
      accessories: [
        { item_name: 'Accessory 1', quantity: 1 },
        { item_name: 'Accessory 2', quantity: 1 },
      ],
    };

    afterEach(async () => {
      // Clean up created products after each test in this block
      try {
        await client.query('BEGIN');
        await client.query(
          'DELETE FROM product_accessories WHERE product_id IN (SELECT id FROM products WHERE product_name = $1)',
          [newProduct.product_name]
        );
        await client.query('DELETE FROM products WHERE product_name = $1', [
          newProduct.product_name,
        ]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });

    it('should create a new product when authenticated', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.product_name).toBe(newProduct.product_name);
      expect(parseFloat(response.body.price)).toBe(newProduct.price);
      expect(response.body.category).toBe(newProduct.category);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid product data', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_name: '',
          price: -100,
          category: 'invalid',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      const product = response.body.find(
        (p: TestProduct) => p.id === testProductId
      );
      expect(product).toBeDefined();
      expect(product.product_name).toBe(testProduct.product_name);
    });
  });

  describe('GET /:id', () => {
    it('should return a product by ID', async () => {
      const response = await request(app).get(`/api/products/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testProductId);
      expect(response.body.product_name).toBe(testProduct.product_name);
      expect(parseFloat(response.body.price)).toBe(testProduct.price);
      expect(response.body.category).toBe(testProduct.category);
      expect(Array.isArray(response.body.features)).toBeTruthy();
      expect(Array.isArray(response.body.accessories)).toBeTruthy();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/99999');
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app).get('/api/products/invalid');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /category/:category', () => {
    it('should return products by valid category', async () => {
      const response = await request(app).get(
        '/api/products/category/headphones'
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(
        response.body.some((p: TestProduct) => p.id === testProductId)
      ).toBeTruthy();
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app).get('/api/products/category/invalid');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /popular', () => {
    it('should return top products', async () => {
      const response = await request(app).get('/api/products/popular');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});
