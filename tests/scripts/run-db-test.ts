import DatabaseTestUtils from '../../src/utils/db-test.utils';

async function runDatabaseTests(): Promise<void> {
  try {
    // Initialize the test database
    console.log('Initializing test database...');
    await DatabaseTestUtils.init();

    // Setup test database schema
    console.log('Setting up test database schema...');
    await DatabaseTestUtils.setupTestDb();

    console.log('Test database setup completed successfully.');

    // Here you could run your actual database tests
    // For now, we'll just verify the connection
    await DatabaseTestUtils.testConnection();
    console.log('Database connection test successful.');
  } catch (error) {
    console.error('Error during database testing:', error);
    process.exit(1);
  } finally {
    // Cleanup
    try {
      console.log('Cleaning up test database...');
      await DatabaseTestUtils.teardownTestDb();
      await DatabaseTestUtils.cleanup();
      console.log('Cleanup completed successfully.');
    } catch (error) {
      console.error('Error during cleanup:', error);
      process.exit(1);
    }
  }
}

// Run the tests
runDatabaseTests().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
