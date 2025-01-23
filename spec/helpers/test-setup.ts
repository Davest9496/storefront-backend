import { config } from 'dotenv';
import { Pool } from 'pg';

// Load test environment variables
config({ path: '.env.test' });

// Create a test database pool
export const testDb = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_TEST_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// Helper function to reset test database tables
export async function resetTestDb(): Promise<void> {
  const client = await testDb.connect();
  try {
    // Truncate all tables and reset sequences
    await client.query(`
            TRUNCATE TABLE order_products CASCADE;
            TRUNCATE TABLE orders CASCADE;
            TRUNCATE TABLE products CASCADE;
            TRUNCATE TABLE users CASCADE;
        `);
  } finally {
    client.release();
  }
}

// Helper function to create test data
export async function createTestUser(): Promise<{ id: number; token: string }> {
  const client = await testDb.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (first_name, last_name, email, password_digest)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
      ['Test', 'User', 'test@example.com', 'hashedpassword']
    );

    // Generate and return test token
    return {
      id: result.rows[0].id,
      token: 'test-token',
    };
  } finally {
    client.release();
  }
}
