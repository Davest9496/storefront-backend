// // src/tests/integration/user.routes.spec.ts

// import supertest from 'supertest';
// import app from '../../server';
// import { generateToken } from '../../middleware/auth.middleware';
// import client from '../../config/database.config';

// const request = supertest(app);

// describe('User Endpoints', () => {
//   // Test data references that we'll use across our test suites
//   let token: string;
//   let userId: number;
//   let testUserEmail = 'test@example.com';
//   let otherUserId: number;
//   let otherUserToken: string;
//   const otherUserEmail = 'existing@example.com';

//   // Helper function to clean up our test database between runs
//   async function cleanTestDatabase(): Promise<void> {
//     const conn = await client.connect();
//     try {
//       await conn.query('BEGIN');
//       // We clean up all test users in a single transaction for efficiency
//       await conn.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [
//         testUserEmail,
//         'newuser@example.com',
//         otherUserEmail,
//       ]);
//       await conn.query('COMMIT');
//     } catch (error) {
//       await conn.query('ROLLBACK');
//       throw error;
//     } finally {
//       conn.release();
//     }
//   }

//   beforeAll(async () => {
//     await cleanTestDatabase();

//     // First, create our primary test user
//     const userData = {
//       email: testUserEmail,
//       password: 'password123',
//       first_name: 'Test',
//       last_name: 'User',
//     };

//     const response = await request.post('/api/users').send(userData);
//     if (response.status !== 201) {
//       throw new Error(
//         'Failed to create test user: ' + JSON.stringify(response.body)
//       );
//     }

//     userId = response.body.id;
//     token = generateToken(userId, userData.email);

//     // Then create a second user for testing authorization and email conflict scenarios
//     const otherUserData = {
//       email: otherUserEmail,
//       password: 'password123',
//       first_name: 'Other',
//       last_name: 'User',
//     };

//     const otherResponse = await request.post('/api/users').send(otherUserData);
//     otherUserId = otherResponse.body.id;
//     otherUserToken = generateToken(otherUserId, otherUserEmail);
//   });

//   afterAll(async () => {
//     await cleanTestDatabase();
//   });

//   describe('POST /api/users (User Creation)', () => {
//     it('successfully creates a new user with valid data', async () => {
//       const newUser = {
//         email: 'newuser@example.com',
//         password: 'password123',
//         first_name: 'New',
//         last_name: 'User',
//       };

//       const response = await request.post('/api/users').send(newUser);

//       // Verify both the response status and the structure of the created user
//       expect(response.status).toBe(201);
//       expect(response.body.id).toBeDefined();
//       expect(typeof response.body.id).toBe('number');
//       expect(response.body.email).toBe(newUser.email);
//       expect(response.body.first_name).toBe(newUser.first_name);
//       expect(response.body.last_name).toBe(newUser.last_name);
//       // Ensure sensitive data is not returned
//       expect(response.body.password_digest).toBeUndefined();
//       expect(response.body.password).toBeUndefined();
//     });

//     it('prevents creation of user with existing email', async () => {
//       const duplicateUser = {
//         email: testUserEmail,
//         password: 'password123',
//         first_name: 'Test',
//         last_name: 'User',
//       };

//       const response = await request.post('/api/users').send(duplicateUser);

//       expect(response.status).toBe(409);
//       expect(response.body.error).toBeDefined();
//       expect(response.body.error).toContain('Email already exists');
//     });

//     it('validates required fields during user creation', async () => {
//       const invalidUser = {
//         email: 'invalid@test.com',
//         // Missing required fields to test validation
//       };

//       const response = await request.post('/api/users').send(invalidUser);

//       expect(response.status).toBe(400);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   describe('GET /api/users (User Retrieval)', () => {
//     it('requires authentication token for user list', async () => {
//       const response = await request.get('/api/users');
//       expect(response.status).toBe(401);
//     });

//     it('returns user list with valid token', async () => {
//       const response = await request
//         .get('/api/users')
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBeTruthy();
//       expect(response.body.length).toBeGreaterThan(0);

//       // Verify the structure of returned user objects
//       const user = response.body[0];
//       expect(user.id).toBeDefined();
//       expect(user.email).toBeDefined();
//       expect(user.first_name).toBeDefined();
//       expect(user.last_name).toBeDefined();
//       expect(user.password_digest).toBeUndefined();
//     });
//   });

//   describe('User Profile Operations', () => {
//     it('retrieves specific user with proper authorization', async () => {
//       const response = await request
//         .get(`/api/users/${userId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.id).toBe(userId);
//       expect(response.body.email).toBe(testUserEmail);
//     });

//     it("prevents access to another user's profile", async () => {
//       const response = await request
//         .get(`/api/users/${otherUserId}`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(403);
//       expect(response.body.error).toBeDefined();
//     });

//     it('successfully updates user profile', async () => {
//       const updateData = {
//         first_name: 'Updated',
//       };

//       const response = await request
//         .put(`/api/users/${userId}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send(updateData);

//       expect(response.status).toBe(200);
//       expect(response.body.first_name).toBe(updateData.first_name);
//       expect(response.body.email).toBe(testUserEmail);
//     });

//     it("prevents updates to another user's email", async () => {
//       const updateData = {
//         email: otherUserEmail,
//       };

//       const response = await request
//         .put(`/api/users/${userId}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send(updateData);

//       expect(response.status).toBe(409);
//       expect(response.body.error).toBeDefined();
//       expect(response.body.error).toContain('Email already exists');
//     });

//     it('allows a user to keep their current email', async () => {
//       const updateData = {
//         email: testUserEmail,
//         first_name: 'UpdatedAgain',
//       };

//       const response = await request
//         .put(`/api/users/${userId}`)
//         .set('Authorization', `Bearer ${token}`)
//         .send(updateData);

//       expect(response.status).toBe(200);
//       expect(response.body.email).toBe(testUserEmail);
//       expect(response.body.first_name).toBe('UpdatedAgain');
//     });

//     it('prevents unauthorized profile updates', async () => {
//       const updateData = {
//         first_name: 'Hacked',
//       };

//       const response = await request
//         .put(`/api/users/${userId}`)
//         .set('Authorization', `Bearer ${otherUserToken}`)
//         .send(updateData);

//       expect(response.status).toBe(403);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   describe('User Orders', () => {
//     it('retrieves user orders with authentication', async () => {
//       const response = await request
//         .get(`/api/users/${userId}/orders`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body)).toBeTruthy();
//     });

//     it("prevents access to another user's orders", async () => {
//       const response = await request
//         .get(`/api/users/${userId}/orders`)
//         .set('Authorization', `Bearer ${otherUserToken}`);

//       expect(response.status).toBe(403);
//       expect(response.body.error).toBeDefined();
//     });
//   });
// });
