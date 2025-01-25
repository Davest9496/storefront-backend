"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const productRoutes_1 = __importDefault(require("../../../src/routes/api/productRoutes"));
describe('Product Routes', () => {
    let app;
    let mockClient;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api/products', productRoutes_1.default);
        mockClient = {
            query: jasmine.createSpy('query'),
            release: jasmine.createSpy('release'),
        };
        const mockPool = {
            connect: () => Promise.resolve(mockClient),
        };
        spyOn(require('../../../src/config/db.config'), 'createPool').and.returnValue(mockPool);
    });
    beforeEach(() => {
        mockClient.query.calls.reset();
    });
    describe('GET /:id', () => {
        it('should return a product by ID', async () => {
            const mockProduct = {
                rows: [
                    {
                        id: 1,
                        product_name: 'Test Product',
                        price: 99.99,
                        category: 'headphones',
                    },
                ],
            };
            mockClient.query.and.returnValue(Promise.resolve(mockProduct));
            const response = await (0, supertest_1.default)(app).get('/api/products/1');
            expect(response.status).toBe(200);
        });
        it('should return 404 for non-existent product', async () => {
            mockClient.query.and.returnValue(Promise.resolve({ rows: [] }));
            const response = await (0, supertest_1.default)(app).get('/api/products/999');
            expect(response.status).toBe(404);
        });
    });
    describe('GET /popular', () => {
        it('should return popular products', async () => {
            const mockProducts = {
                rows: [
                    {
                        id: 1,
                        product_name: 'Test Product',
                        price: 99.99,
                        category: 'headphones',
                    },
                ],
            };
            mockClient.query.and.returnValue(Promise.resolve(mockProducts));
            const response = await (0, supertest_1.default)(app).get('/api/products/popular');
            expect(response.status).toBe(200);
        });
    });
    describe('GET /category/:category', () => {
        it('should return products by category', async () => {
            const mockProducts = {
                rows: [
                    {
                        id: 1,
                        product_name: 'Test Product',
                        price: 99.99,
                        category: 'headphones',
                    },
                ],
            };
            mockClient.query.and.returnValue(Promise.resolve(mockProducts));
            const response = await (0, supertest_1.default)(app).get('/api/products/category/headphones');
            expect(response.status).toBe(200);
        });
        it('should return 400 for invalid category', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/products/category/invalid');
            expect(response.status).toBe(400);
        });
    });
    describe('POST /', () => {
        it('should require authentication', async () => {
            const response = await (0, supertest_1.default)(app).post('/api/products').send({
                product_name: 'Test Product',
                price: 99.99,
                category: 'headphones',
            });
            expect(response.status).toBe(401);
        });
    });
});
//# sourceMappingURL=productRoutes.spec.js.map