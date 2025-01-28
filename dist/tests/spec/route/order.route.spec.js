"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../../src/server"));
const database_1 = __importDefault(require("../../../src/database"));
const auth_service_1 = require("../../../src/services/auth.service");
describe('Order Routes', () => {
    let authToken;
    let testUserId;
    let testProductId;
    let testOrderId;
    // Test data
    const testUser = {
        first_name: 'Order',
        last_name: 'Test',
        email: 'order.test@example.com',
        password: 'OrderTest123!',
    };
    const testProduct = {
        product_name: 'Test Headphones',
        price: 299.99,
        category: 'headphones',
        product_desc: 'Test product description',
        features: ['Feature 1', 'Feature 2'],
    };
    beforeAll(async () => {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Clean up existing test data
            await client.query('DELETE FROM order_products WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = $1))', [testUser.email]);
            await client.query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [testUser.email]);
            await client.query('DELETE FROM users WHERE email = $1', [
                testUser.email,
            ]);
            await client.query('DELETE FROM products WHERE product_name = $1', [
                testProduct.product_name,
            ]);
            // Create test user
            const hashedPassword = await auth_service_1.AuthService.hashPassword(testUser.password);
            const userResult = await client.query('INSERT INTO users (first_name, last_name, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id', [
                testUser.first_name,
                testUser.last_name,
                testUser.email,
                hashedPassword,
            ]);
            testUserId = userResult.rows[0].id;
            // Create test product
            const productResult = await client.query('INSERT INTO products (product_name, price, category, product_desc, features) VALUES ($1, $2, $3, $4, $5) RETURNING id', [
                testProduct.product_name,
                testProduct.price,
                testProduct.category,
                testProduct.product_desc,
                testProduct.features,
            ]);
            testProductId = productResult.rows[0].id;
            await client.query('COMMIT');
            // Generate auth token
            authToken = auth_service_1.AuthService.generateToken({
                id: testUserId,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    });
    afterAll(async () => {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Clean up test data in correct order
            await client.query('DELETE FROM order_products WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = $1))', [testUser.email]);
            await client.query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [testUser.email]);
            await client.query('DELETE FROM users WHERE email = $1', [
                testUser.email,
            ]);
            await client.query('DELETE FROM products WHERE product_name = $1', [
                testProduct.product_name,
            ]);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
        await database_1.default.end();
    });
    describe('POST /api/orders', () => {
        it('should create a new order when authenticated', async () => {
            const orderData = {
                user_id: testUserId,
                products: [
                    {
                        product_id: testProductId,
                        quantity: 2,
                    },
                ],
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(orderData);
            expect(response.status).toBe(201);
            expect(response.body).toBeDefined();
            expect(response.body.user_id).toBe(testUserId);
            expect(response.body.status).toBe('active');
            expect(Array.isArray(response.body.products)).toBeTruthy();
            expect(response.body.products.length).toBe(1);
            expect(response.body.products[0].quantity).toBe(2);
            testOrderId = response.body.id;
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/orders')
                .send({ user_id: testUserId, products: [] });
            expect(response.status).toBe(401);
        });
        it('should return 400 for invalid order data', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ user_id: testUserId }); // Missing products
            expect(response.status).toBe(400);
        });
    });
    describe('GET /api/orders/current/:userId', () => {
        it('should return current active order when authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/api/orders/current/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.user_id).toBe(testUserId);
            expect(response.body.status).toBe('active');
            expect(Array.isArray(response.body.products)).toBeTruthy();
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default).get(`/api/orders/current/${testUserId}`);
            expect(response.status).toBe(401);
        });
        it('should return 404 when no active order exists', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/orders/current/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
        });
    });
    describe('GET /api/orders/completed/:userId', () => {
        beforeAll(async () => {
            if (testOrderId) {
                const client = await database_1.default.connect();
                try {
                    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [
                        'complete',
                        testOrderId,
                    ]);
                }
                finally {
                    client.release();
                }
            }
        });
        it('should return completed orders when authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/api/orders/completed/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].status).toBe('complete');
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default).get(`/api/orders/completed/${testUserId}`);
            expect(response.status).toBe(401);
        });
        it('should return empty array when no completed orders exist', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/orders/completed/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(0);
        });
    });
    describe('PUT /api/orders/:id/status', () => {
        let newOrderId;
        beforeEach(async () => {
            // Create a new order for status update tests
            const client = await database_1.default.connect();
            try {
                const result = await client.query('INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id', [testUserId, 'active']);
                newOrderId = result.rows[0].id;
            }
            finally {
                client.release();
            }
        });
        it('should update order status when authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/orders/${newOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'complete' });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Order status updated successfully');
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/orders/${newOrderId}/status`)
                .send({ status: 'complete' });
            expect(response.status).toBe(401);
        });
        it('should return 400 for invalid status', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/orders/${newOrderId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'invalid' });
            expect(response.status).toBe(400);
        });
        it('should return 404 for non-existent order', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put('/api/orders/99999/status')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'complete' });
            expect(response.status).toBe(404);
        });
    });
});
//# sourceMappingURL=order.route.spec.js.map