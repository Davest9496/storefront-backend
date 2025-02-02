// src/tests/setup/database.ts

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

dotenv.config();

export class TestDatabase {
  private static pool: Pool;

  static async initialize(): Promise<void> {
    // Create a connection pool for the test database
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_TEST_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });

    try {
      // Test the connection
      const client = await this.pool.connect();
      client.release();
      console.log('Successfully connected to test database');
    } catch (err) {
      console.error('Failed to connect to test database:', err);
      throw err;
    }
  }

  static async reset(): Promise<void> {
    try {
      // First, run down migrations to clean the database
      console.log('Running down migrations...');
      await execAsync('yarn migrate:down:test');

      // Then run up migrations to set up fresh tables
      console.log('Running up migrations...');
      await execAsync('yarn migrate:up:test');

      console.log('Database reset completed successfully');
    } catch (err) {
      console.error('Failed to reset database:', err);
      throw err;
    }
  }

  static async cleanup(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Initialize the database when this module is imported
TestDatabase.initialize().catch(console.error);
