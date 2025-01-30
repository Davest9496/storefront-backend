// src/tests/models/user.model.spec.ts

import { Pool } from 'pg';
import { UserStore } from '../../models/user.model';
import { TestDatabase } from '../setup/database';
import { CreateUserDTO } from '../../types';

describe('User Model', () => {
  let store: UserStore;
  let client: Pool;
  let testUser: CreateUserDTO;

  beforeAll(() => {
    client = TestDatabase.getInstance();
    store = new UserStore(client);
  });

  beforeEach(async () => {
    await TestDatabase.reset();

    testUser = {
      email: 'test@example.com',
      password: 'test123',
      first_name: 'Test',
      last_name: 'User',
    };
  });

  it('should create a new user successfully', async () => {
    const result = await store.create(testUser);

    expect(result).toBeDefined();
    expect(result.email).toBe(testUser.email);
    expect(result.first_name).toBe(testUser.first_name);
    expect(result.last_name).toBe(testUser.last_name);
    expect(result.id).toBeDefined();
    expect(Object.keys(result)).not.toContain('password');
    expect(Object.keys(result)).not.toContain('password_digest');
  });

  // Updated test for duplicate emails that checks for partial message match
  it('should not allow duplicate emails', async () => {
    // First creation should succeed
    await store.create(testUser);

    // Second creation should fail
    try {
      await store.create(testUser);
      // If we get here, the test should fail because an error wasn't thrown
      fail('Expected error was not thrown');
    } catch (error) {
      // Check if the error message includes our expected text
      expect((error as Error).message).toContain('Email already exists');
    }
  });

  it('should authenticate valid credentials', async () => {
    await store.create(testUser);

    const result = await store.authenticate(testUser.email, testUser.password);

    expect(result).toBeTruthy();
    if (result) {
      expect(result.email).toBe(testUser.email);
      expect(result.first_name).toBe(testUser.first_name);
      expect(result.last_name).toBe(testUser.last_name);
    }
  });

  it('should reject invalid credentials', async () => {
    await store.create(testUser);

    const result = await store.authenticate(testUser.email, 'wrongpassword');

    expect(result).toBeNull();
  });

  it('should return null for non-existent user', async () => {
    const result = await store.authenticate(
      'nonexistent@example.com',
      'anypassword'
    );

    expect(result).toBeNull();
  });
});
