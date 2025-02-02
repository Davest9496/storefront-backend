import { TestDatabase } from './setup/database';

// Global setup
beforeAll(async () => {
  try {
    // Initialize test database and run migrations
    await TestDatabase.initialize();
    await TestDatabase.reset();
    console.log('Test environment setup completed');
  } catch (error) {
    console.error('Test environment setup failed:', error);
    throw error;
  }
});

// Global cleanup
afterAll(async () => {
  try {
    await TestDatabase.cleanup();
    console.log('Test environment cleanup completed');
  } catch (error) {
    console.error('Test environment cleanup failed:', error);
  }
});
