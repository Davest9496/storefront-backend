import { UserStore } from '../../models/user.model';
import { CreateUserDTO, User } from '../../types/shared.types';

describe('User Model', () => {
  const store = new UserStore();
  let testUser: User;
  const testUserData: CreateUserDTO = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: 'password123',
  };

  describe('Model methods existence', () => {
    it('should have an index method', () => {
      expect(store.index).toBeDefined();
    });

    it('should have a show method - get user by Id', () => {
      expect(store.show).toBeDefined();
    });

    it('should have a create method - signup', () => {
      expect(store.create).toBeDefined();
    });

    it('should have an update method', () => {
      expect(store.update).toBeDefined();
    });

    it('should have a delete method', () => {
      expect(store.delete).toBeDefined();
    });

    it('should have an authenticate method - login', () => {
      expect(store.authenticate).toBeDefined();
    });
  });

  describe('User CRUD operations', () => {
    it('should create a new user', async () => {
      const result = await store.create(testUserData);
      testUser = result;

      expect(result).toBeDefined();
      expect(result.first_name).toBe(testUserData.first_name);
      expect(result.last_name).toBe(testUserData.last_name);
      expect(result.email).toBe(testUserData.email);
      expect('password_digest' in result).toBeFalsy();
    });

    it('should not create a user with duplicate email', async () => {
      await expectAsync(store.create(testUserData)).toBeRejectedWithError(
        /Could not create user. Error: Email already exists/
      );
    });

    it('should get all users', async () => {
      const result = await store.index();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].email).toBe(testUserData.email);
    });

    it('should get a specific user', async () => {
      const result = await store.show(testUser.id as number);

      expect(result).toBeDefined();
      expect(result?.email).toBe(testUserData.email);
    });

    it('should return null for non-existent user', async () => {
      const result = await store.show(999999);
      expect(result).toBeNull();
    });

    it('should update user information', async () => {
      const updates = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      // Ensure testUser.id exists before updating
      if (!testUser.id) {
        throw new Error('Test user ID is not defined');
      }

      const result = await store.update(testUser.id, updates);

      expect(result.first_name).toBe(updates.first_name);
      expect(result.last_name).toBe(updates.last_name);
      expect(result.email).toBe(testUserData.email);
    });

    it('should authenticate with correct credentials', async () => {
      const result = await store.authenticate(
        testUserData.email,
        testUserData.password
      );

      expect(result).toBeDefined();
      expect(result?.email).toBe(testUserData.email);
    });

    it('should not authenticate with incorrect password', async () => {
      const result = await store.authenticate(
        testUserData.email,
        'wrongpassword'
      );
      expect(result).toBeNull();
    });

    it('should update password successfully', async () => {
      if (!testUser.id) {
        throw new Error('Test user ID is not defined');
      }

      const passwordData = {
        current_password: testUserData.password,
        new_password: 'newpassword123',
      };

      await expectAsync(
        store.updatePassword(testUser.id, passwordData)
      ).toBeResolved();

      // Verify new password works for authentication
      const authResult = await store.authenticate(
        testUserData.email,
        passwordData.new_password
      );
      expect(authResult).toBeDefined();
    });

    it('should delete a user', async () => {
      if (!testUser.id) {
        throw new Error('Test user ID is not defined');
      }

      await expectAsync(store.delete(testUser.id)).toBeResolved();

      // Verify user no longer exists
      const result = await store.show(testUser.id);
      expect(result).toBeNull();
    });
  });

  describe('Recent Orders', () => {
    it('should get recent orders for a user', async () => {
      if (!testUser.id) {
        throw new Error('Test user ID is not defined');
      }

      const result = await store.getRecentOrders(testUser.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });
});
