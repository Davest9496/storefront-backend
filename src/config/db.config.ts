import { Pool } from 'pg';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Validate required environment variables
const validateEnvVariables = () => {
  const required = ['DB_NAME', 'DB_USER'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Create and configure the database pool
export const createPool = (): Pool => {
  // Validate environment variables before creating pool
  validateEnvVariables();

  // Log database connection details (excluding sensitive information)
  console.log('Initializing database connection with:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
  });

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Add error handler for the pool
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client:', err);
  });

  return pool;
};

// Test database connection
export const testConnection = async (pool: Pool): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0].now);
    return true;
  } finally {
    client.release();
  }
};
