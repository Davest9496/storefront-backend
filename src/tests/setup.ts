import dotenv from 'dotenv';
import { join } from 'path';
import { TestDatabase } from './setup/database';
import './helpers/reporter'; // Import the reporter configuration

// First, we load our test environment variables
dotenv.config({ path: join(__dirname, '../../.env.test') });

// Before running any tests, we need to prepare our test environment
beforeAll(async () => {
  try {
    // Reset the database to ensure we start with a clean state
    await TestDatabase.reset();
    console.log('Test database prepared successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// After all tests complete, we need to clean up our resources
afterAll(async () => {
  try {
    // Close the database connection to prevent connection leaks
    await TestDatabase.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
});
