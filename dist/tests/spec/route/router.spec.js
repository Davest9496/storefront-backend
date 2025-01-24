"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const router_1 = __importDefault(require("../../../src/routes/router"));
const database_1 = require("../../helpers/database");
describe('Router Integration Tests', () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api', router_1.default);
    });
    afterAll(async () => {
        await (0, database_1.closePool)();
    });
    beforeEach(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api', router_1.default);
    });
    describe('User Routes', () => {
        it('should mount user routes at /api/user', async () => {
            await (0, supertest_1.default)(app).get('/api/user').expect(401);
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
                .expect(400);
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