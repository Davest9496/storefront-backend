import { Pool } from 'pg';
import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables for the test database
dotenv.config({ path: join(__dirname, '../../../.env.test') });

export class TestDatabase {
  // We use a private static instance to implement the singleton pattern
  private static instance: Pool;

  // Get or create the database connection pool
  static getInstance(): Pool {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new Pool({
        host: process.env.DB_HOST,
        database: process.env.DB_TEST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
    }
    return TestDatabase.instance;
  }

  // Reset the database to a clean state
  static async reset(): Promise<void> {
    const conn = await this.getInstance().connect();
    try {
      // Use a transaction to ensure all operations succeed or none do
      await conn.query('BEGIN');

      // Drop existing tables and types in the correct order
      await conn.query('DROP TABLE IF EXISTS order_products CASCADE');
      await conn.query('DROP TABLE IF EXISTS orders CASCADE');
      await conn.query('DROP TABLE IF EXISTS products CASCADE');
      await conn.query('DROP TABLE IF EXISTS users CASCADE');
      await conn.query('DROP TYPE IF EXISTS order_status CASCADE');
      await conn.query('DROP TYPE IF EXISTS product_category CASCADE');

      // Recreate the custom types needed for our schema
      await conn.query(
        `CREATE TYPE order_status AS ENUM ('active', 'complete')`
      );
      await conn.query(
        `CREATE TYPE product_category AS ENUM ('headphones', 'speakers', 'earphones')`
      );

      // Recreate all tables with their proper constraints
      await conn.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_digest VARCHAR(250) NOT NULL
        )
      `);

      await conn.query(`
        CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          product_name VARCHAR(100) NOT NULL,
          price DECIMAL(10,2) NOT NULL CHECK (price > 0),
          category product_category NOT NULL,
          product_desc VARCHAR(250),
          image_name VARCHAR(255) NOT NULL,
          product_features TEXT[],
          product_accessories TEXT[]
        )
      `);

      await conn.query(`
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          status order_status NOT NULL DEFAULT 'active',
          CONSTRAINT fk_user 
              FOREIGN KEY (user_id) 
              REFERENCES users(id) 
              ON DELETE CASCADE
        )
      `);

      await conn.query(`
        CREATE TABLE order_products (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          CONSTRAINT fk_order 
              FOREIGN KEY (order_id) 
              REFERENCES orders(id) 
              ON DELETE CASCADE,
          CONSTRAINT fk_product 
              FOREIGN KEY (product_id) 
              REFERENCES products(id) 
              ON DELETE CASCADE
        )
      `);

      // Commit the transaction if all operations succeeded
      await conn.query('COMMIT');
    } catch (error) {
      // Roll back the transaction if any operation failed
      await conn.query('ROLLBACK');
      throw error;
    } finally {
      // Always release the connection back to the pool
      conn.release();
    }
  }

  // Clean up database connections
  static async close(): Promise<void> {
    if (TestDatabase.instance) {
      await TestDatabase.instance.end();
    }
  }
}
