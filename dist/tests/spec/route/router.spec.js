"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const router_1 = __importDefault(require("../../../src/routes/router"));
describe('Router Integration Tests', () => {
    let app;
    beforeAll(() => {
        // Initialize the express app
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api', router_1.default);
    });
    // No need for afterAll since TestDb handles pool cleanup globally
    describe('User Routes', () => {
        it('should mount user routes at /api/users', async () => {
            await (0, supertest_1.default)(app).get('/api/users').expect(401);
        });
    });
    describe('Auth Routes', () => {
        it('should mount auth routes at /api/auth', async () => {
            await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123',
            })
                .expect(401);
        });
    });
    describe('Product Routes', () => {
        it('should mount product routes at /api/products', async () => {
            await (0, supertest_1.default)(app).get('/api/products').expect(200);
        });
        it('should require auth for protected product routes', async () => {
            await (0, supertest_1.default)(app)
                .post('/api/products')
                .send({
                product_name: 'Test Product',
                price: 99.99,
                category: 'headphones',
            })
                .expect(401);
        });
    });
    describe('Non-existent Routes', () => {
        it('should return 404 for undefined routes', async () => {
            await (0, supertest_1.default)(app).get('/api/nonexistent').expect(404);
        });
    });
});
//# sourceMappingURL=router.spec.js.map