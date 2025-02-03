import { UserStore } from '../../models/user.model';
import { CreateUserDTO } from '../../types/shared.types';
import bcrypt from 'bcrypt';
import { passwordUtils } from '../../middleware/auth.middleware';

describe('User Model', () => {
  const store = new UserStore();

  const testUser: CreateUserDTO = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    password: 'password123',
  };

  let createdUserId: number;

  describe('create method', () => {
    it('should create a new user with hashed password', async () => {
      const result = await store.create(testUser);
      createdUserId = result.id as number;

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(testUser.email);
      expect(result.first_name).toBe(testUser.first_name);
      expect(result.last_name).toBe(testUser.last_name);
      expect(result.password_digest).toBeDefined();
      expect(result.password_digest).not.toBe(testUser.password);

      // Verify password hashing with pepper
      const pepper = passwordUtils.getPepper();
      const isValidPassword = await bcrypt.compare(
        testUser.password + pepper,
        result.password_digest
      );
      expect(isValidPassword).toBe(true);
    });

    it('should not allow duplicate emails', async () => {
      try {
        await store.create(testUser);
        fail('Should not create user with duplicate email');
      } catch (err) {
        expect(err instanceof Error).toBe(true);
        expect((err as Error).message).toContain('Email already exists');
      }
    });
  });

  describe('index method', () => {
    it('should return a list of users', async () => {
      const result = await store.index();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const foundUser = result.find((user) => user.email === testUser.email);
      expect(foundUser).toBeDefined();
      expect(foundUser?.first_name).toBe(testUser.first_name);
    });
  });

  describe('show method', () => {
    it('should return the correct user by ID', async () => {
      const result = await store.show(createdUserId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(createdUserId);
      expect(result?.email).toBe(testUser.email);
      expect(result?.first_name).toBe(testUser.first_name);
      expect(result?.last_name).toBe(testUser.last_name);
    });

    it('should return null for non-existent user ID', async () => {
      const result = await store.show(9999);
      expect(result).toBeNull();
    });
  });

  describe('authenticate method', () => {
    it('should return the user when credentials are correct', async () => {
      const result = await store.authenticate(
        testUser.email,
        testUser.password
      );

      expect(result).toBeDefined();
      expect(result?.email).toBe(testUser.email);
    });

    it('should return null when email is incorrect', async () => {
      const result = await store.authenticate(
        'wrong@email.com',
        testUser.password
      );
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      const result = await store.authenticate(testUser.email, 'wrongpassword');
      expect(result).toBeNull();
    });
  });
});
