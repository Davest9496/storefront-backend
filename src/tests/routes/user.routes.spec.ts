import supertest from 'supertest';
import app from '../../../src/server';
import { UserStore } from '../../models/user.model';
import { generateToken } from '../../middleware/auth.middleware';
import { CreateUserDTO, User } from '../../types/shared.types';

const request = supertest(app);
const store = new UserStore();

describe('User Routes', () => {
  let testUser: User;
  let userToken: string;
  let anotherUserToken: string;

  const testUserData: CreateUserDTO = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: 'password123',
  };

  const anotherUserData: CreateUserDTO = {
    first_name: 'Another',
    last_name: 'User',
    email: 'another@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    // Create test users and get their tokens
    testUser = await store.create(testUserData);
    const anotherUser = await store.create(anotherUserData);

    userToken = generateToken(testUser.id as number, testUser.email);
    anotherUserToken = generateToken(
      anotherUser.id as number,
      anotherUser.email
    );
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUserData: CreateUserDTO = {
        first_name: 'New',
        last_name: 'User',
        email: 'new@example.com',
        password: 'password123',
      };

      const response = await request.post('/api/users').send(newUserData);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(newUserData.email);
      expect(response.body.user.password_digest).toBeUndefined();
    });

    it('should not create user with existing email', async () => {
      const response = await request.post('/api/users').send(testUserData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email already exists');
    });

    it('should validate required fields', async () => {
      const response = await request.post('/api/users').send({
        first_name: 'Test',
        // Missing required fields
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

 describe('GET /api/users', () => {

   it('should get all users with valid token', async () => {
     const response = await request
       .get('/api/users')
       .set('Authorization', `Bearer ${userToken}`);

     expect(response.status).toBe(200);
     expect(Array.isArray(response.body)).toBe(true);
     expect(response.body.length).toBeGreaterThan(0);
   });

   it('should not get users without token', async () => {
     const response = await request.get('/api/users');
     expect(response.status).toBe(401);
     expect(response.body.error).toBeDefined();
   });

   it('should not get users with invalid token', async () => {
     const response = await request
       .get('/api/users')
       .set('Authorization', 'Bearer invalid-token');

     expect(response.status).toBe(401);
     expect(response.body.error).toBeDefined();
   });
 });

  describe('GET /api/users/:id', () => {
    it('should get user by id with valid token', async () => {
      const response = await request
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email);
    });

    it("should not get another user's data", async () => {
      const response = await request
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with valid token', async () => {
      const updates = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      const response = await request
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe(updates.first_name);
      expect(response.body.last_name).toBe(updates.last_name);
    });

    it("should not update another user's data", async () => {
      const response = await request
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ first_name: 'Hacked' });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/users/:id/password', () => {
    it('should update password with valid credentials', async () => {
      const passwordData = {
        current_password: testUserData.password,
        new_password: 'newpassword123',
      };

      const response = await request
        .put(`/api/users/${testUser.id}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Password updated successfully');
    });

    it('should not update password with incorrect current password', async () => {
      const passwordData = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
      };

      const response = await request
        .put(`/api/users/${testUser.id}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Current password is incorrect');
    });
  });

  describe('GET /api/users/:id/orders/recent', () => {
    it('should get recent orders for user', async () => {
      const response = await request
        .get(`/api/users/${testUser.id}/orders/recent`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not get orders for another user', async () => {
      const response = await request
        .get(`/api/users/${testUser.id}/orders/recent`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it("should not delete another user's account", async () => {
      const response = await request
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(response.status).toBe(403);
    });

    it("should delete user's own account", async () => {
      const response = await request
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('User deleted successfully');

      // Verify user is deleted
      const checkResponse = await request
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(checkResponse.status).toBe(404);
    });
  });
});
