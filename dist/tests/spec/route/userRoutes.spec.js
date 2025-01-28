"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../../src/server"));
const testDb_1 = __importDefault(require("../../helpers/testDb"));
const auth_service_1 = require("../../../src/services/auth.service");
const user_service_1 = require("../../../src/services/user.service");
describe('User Routes Integration Tests', () => {
    let authToken;
    let testUserId;
    let client;
    // Test user data
    const testUser = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'TestPassword123!',
    };
    beforeAll(async () => {
        // Create a test user and get auth token
        client = await testDb_1.default.getClient();
        try {
            const userService = new user_service_1.UserService(client);
            const hashedPassword = await auth_service_1.AuthService.hashPassword(testUser.password);
            // Clear test data
            await client.query('DELETE FROM users WHERE email = $1', [
                testUser.email,
            ]);
            // Create test user
            const result = await client.query('INSERT INTO users (first_name, last_name, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id', [
                testUser.first_name,
                testUser.last_name,
                testUser.email,
                hashedPassword,
            ]);
            testUserId = result.rows[0].id;
            authToken = auth_service_1.AuthService.generateToken({
                id: testUserId,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
            });
        }
        finally {
            // Don't release the client here as we'll need it for other operations
        }
    });
    afterAll(async () => {
        try {
            // Clean up test data
            await client.query('DELETE FROM users WHERE email = $1', [
                testUser.email,
            ]);
        }
        finally {
            // Release client in afterAll
        }
    });
    describe('GET /api/users', () => {
        it('should return all users when authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(0);
            const user = response.body.find((u) => u.id === testUserId);
            expect(user).toBeDefined();
            expect(user.firstName).toBe(testUser.first_name);
            expect(user.lastName).toBe(testUser.last_name);
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default).get('/api/users');
            expect(response.status).toBe(401);
        });
        it('should return 401 with invalid token', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/users')
                .set('Authorization', 'Bearer invalid_token');
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/users/:id', () => {
        it('should return user by id when authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(testUserId);
            expect(response.body.firstName).toBe(testUser.first_name);
            expect(response.body.lastName).toBe(testUser.last_name);
        });
        it('should return 404 for non-existent user', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/api/users/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default).get(`/api/users/${testUserId}`);
            expect(response.status).toBe(401);
        });
    });
    describe('PUT /api/users/:id', () => {
        it('should update user when authenticated and authorized', async () => {
            const updateData = {
                first_name: 'Updated',
                last_name: 'Name',
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.first_name).toBe(updateData.first_name);
            expect(response.body.last_name).toBe(updateData.last_name);
        });
        it('should return 403 when updating different user', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put('/api/users/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ first_name: 'Test' });
            expect(response.status).toBe(403);
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/users/${testUserId}`)
                .send({ first_name: 'Test' });
            expect(response.status).toBe(401);
        });
        it('should handle invalid email updates', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/api/users/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ email: 'invalid-email' });
            expect(response.status).toBe(400);
        });
    });
    describe('DELETE /api/users/:id', () => {
        let deleteTestUserId;
        let deleteAuthToken;
        let deleteClient;
        beforeEach(async () => {
            // Create a temporary user for delete tests
            deleteClient = await testDb_1.default.getClient();
            try {
                // Generate a unique email with timestamp
                const uniqueEmail = `delete.test.${Date.now()}@example.com`;
                // Clean up any existing test users
                await deleteClient.query('DELETE FROM users WHERE email LIKE $1', [
                    'delete.test.%@example.com',
                ]);
                const hashedPassword = await auth_service_1.AuthService.hashPassword('TempPass123!');
                const result = await deleteClient.query('INSERT INTO users (first_name, last_name, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id', ['Delete', 'Test', uniqueEmail, hashedPassword]);
                deleteTestUserId = result.rows[0].id;
                deleteAuthToken = auth_service_1.AuthService.generateToken({
                    id: deleteTestUserId,
                    first_name: 'Delete',
                    last_name: 'Test',
                });
            }
            catch (error) {
                throw error;
            }
        });
        it('should delete user when authenticated and authorized', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .delete(`/api/users/${deleteTestUserId}`)
                .set('Authorization', `Bearer ${deleteAuthToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User successfully deleted');
            // Verify user is deleted
            const checkResponse = await (0, supertest_1.default)(server_1.default)
                .get(`/api/users/${deleteTestUserId}`)
                .set('Authorization', `Bearer ${deleteAuthToken}`);
            expect(checkResponse.status).toBe(404);
        });
        it('should return 403 when deleting different user', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .delete('/api/users/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(403);
        });
        it('should return 401 when not authenticated', async () => {
            const response = await (0, supertest_1.default)(server_1.default).delete(`/api/users/${testUserId}`);
            expect(response.status).toBe(401);
        });
        afterEach(async () => {
            try {
                // Clean up any remaining test users
                await deleteClient.query('DELETE FROM users WHERE email LIKE $1', [
                    'delete.test.%@example.com',
                ]);
            }
            finally {
                return;
            }
        });
    });
});
//# sourceMappingURL=userRoutes.spec.js.map