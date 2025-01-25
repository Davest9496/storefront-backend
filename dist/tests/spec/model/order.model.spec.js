"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_model_1 = require("../../../src/models/order.model");
describe('OrderModel', () => {
    let orderModel;
    let mockClient;
    beforeEach(() => {
        mockClient = {
            query: jasmine
                .createSpy('query')
                .and.returnValue(Promise.resolve({ rows: [] })),
            release: jasmine.createSpy('release'),
        };
        orderModel = new order_model_1.OrderModel(mockClient);
    });
    describe('getCurrentOrder', () => {
        it('should return active order with products', async () => {
            const mockOrder = {
                id: 1,
                user_id: 1,
                status: 'active',
            };
            const mockProducts = [
                {
                    id: 1,
                    product_id: 1,
                    quantity: 2,
                    product_name: 'Test Product',
                    price: 299.99,
                    category: 'headphones',
                    features: ['Feature 1'],
                    product_desc: 'Test Product Description',
                },
            ];
            mockClient.query.and.returnValues(Promise.resolve({ rows: [mockOrder] }), Promise.resolve({ rows: mockProducts }));
            const result = await orderModel.getCurrentOrder(1);
            expect(result).toEqual({
                ...mockOrder,
                products: [
                    {
                        id: 1,
                        product_id: 1,
                        quantity: 2,
                        product: {
                            id: 1,
                            product_name: 'Test Product',
                            price: 299.99,
                            category: 'headphones',
                            features: ['Feature 1'],
                            product_desc: 'Test Product Description',
                        },
                    },
                ],
            });
            const queryCall = mockClient.query.calls.first();
            const expectedQuery = "SELECT id, user_id, status FROM orders WHERE user_id = $1 AND status = 'active' ORDER BY id DESC LIMIT 1";
            expect(queryCall.args[0].replace(/\s+/g, ' ').trim()).toBe(expectedQuery.replace(/\s+/g, ' ').trim());
            expect(queryCall.args[1]).toEqual([1]);
        });
        it('should return null if no active order exists', async () => {
            mockClient.query.and.returnValue(Promise.resolve({ rows: [] }));
            const result = await orderModel.getCurrentOrder(1);
            expect(result).toBeNull();
            const queryCall = mockClient.query.calls.first();
            const expectedQuery = "SELECT id, user_id, status FROM orders WHERE user_id = $1 AND status = 'active' ORDER BY id DESC LIMIT 1";
            expect(queryCall.args[0].replace(/\s+/g, ' ').trim()).toBe(expectedQuery.replace(/\s+/g, ' ').trim());
            expect(queryCall.args[1]).toEqual([1]);
        });
    });
    describe('getCompletedOrders', () => {
        it('should return completed orders', async () => {
            const mockOrders = [
                {
                    id: 1,
                    user_id: 1,
                    status: 'complete',
                    products: [],
                },
            ];
            mockClient.query.and.returnValue(Promise.resolve({ rows: mockOrders }));
            const result = await orderModel.getCompletedOrders(1);
            expect(result).toEqual(mockOrders);
            const queryCall = mockClient.query.calls.first();
            expect(queryCall.args[1]).toEqual([1]);
        });
    });
    describe('create', () => {
        it('should create order and return id', async () => {
            const orderData = {
                userId: 1,
                products: [{ productId: 1, quantity: 2 }],
            };
            mockClient.query.and.returnValue(Promise.resolve({ rows: [{ id: 1 }] }));
            const result = await orderModel.create(orderData);
            expect(result).toBe(1);
            const queryCall = mockClient.query.calls.first();
            const expectedQuery = "INSERT INTO orders (user_id, status) VALUES ($1, 'active') RETURNING id";
            expect(queryCall.args[0].replace(/\s+/g, ' ').trim()).toBe(expectedQuery.replace(/\s+/g, ' ').trim());
            expect(queryCall.args[1]).toEqual([orderData.userId]);
        });
    });
    describe('addProducts', () => {
        it('should add multiple products to order', async () => {
            const products = [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 },
            ];
            await orderModel.addProducts(1, products);
            const queryCall = mockClient.query.calls.first();
            expect(queryCall.args[1]).toEqual([1, 1, 2, 2, 1]);
        });
    });
    describe('updateStatus', () => {
        it('should update order status', async () => {
            mockClient.query.and.returnValue(Promise.resolve({ rows: [{ id: 1 }] }));
            const result = await orderModel.updateStatus(1, 'complete');
            expect(result).toBe(true);
            const queryCall = mockClient.query.calls.first();
            const expectedQuery = 'UPDATE orders SET status = $2 WHERE id = $1 RETURNING id';
            expect(queryCall.args[0].replace(/\s+/g, ' ').trim()).toBe(expectedQuery.replace(/\s+/g, ' ').trim());
            expect(queryCall.args[1]).toEqual([1, 'complete']);
        });
        it('should return false if order not found', async () => {
            mockClient.query.and.returnValue(Promise.resolve({ rows: [] }));
            const result = await orderModel.updateStatus(999, 'complete');
            expect(result).toBe(false);
            const queryCall = mockClient.query.calls.first();
            const expectedQuery = 'UPDATE orders SET status = $2 WHERE id = $1 RETURNING id';
            expect(queryCall.args[0].replace(/\s+/g, ' ').trim()).toBe(expectedQuery.replace(/\s+/g, ' ').trim());
            expect(queryCall.args[1]).toEqual([999, 'complete']);
        });
    });
});
//# sourceMappingURL=order.model.spec.js.map