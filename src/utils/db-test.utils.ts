import { Pool } from 'pg';
import dotenv from 'dotenv';

class DatabaseTestUtils {
  private static pool: Pool;

  static async init(): Promise<void> {
    dotenv.config({ path: '.env.test' });

    const dbConfig = {
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
      max: 20,
      idleTimeoutMillis: 30000,
    };

    this.pool = new Pool(dbConfig);
    await this.testConnection();
  }

  static async testConnection(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT NOW()');
    } finally {
      client.release();
    }
  }

  static async setupTestDb(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
                DO $$ 
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
                        CREATE TYPE order_status AS ENUM ('active', 'complete');
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
                        CREATE TYPE product_category AS ENUM ('headphones', 'speakers', 'earphones');
                    END IF;
                END $$;

                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_digest VARCHAR(250) NOT NULL
                );

                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    product_name VARCHAR(100) NOT NULL,
                    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
                    category product_category NOT NULL,
                    product_desc VARCHAR(250),
                    image_name VARCHAR(255) NOT NULL,
                    features TEXT[],
                    accessories TEXT[]
                );

                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    status order_status NOT NULL DEFAULT 'active'
                );

                CREATE TABLE IF NOT EXISTS order_products (
                    id SERIAL PRIMARY KEY,
                    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                    quantity INTEGER NOT NULL CHECK (quantity > 0)
                );
            `);
    } finally {
      client.release();
    }
  }

  static async teardownTestDb(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
                DROP TABLE IF EXISTS order_products CASCADE;
                DROP TABLE IF EXISTS orders CASCADE;
                DROP TABLE IF EXISTS products CASCADE;
                DROP TABLE IF EXISTS users CASCADE;
                DROP TYPE IF EXISTS order_status CASCADE;
                DROP TYPE IF EXISTS product_category CASCADE;
            `);
    } finally {
      client.release();
    }
  }

  static async cleanup(): Promise<void> {
    await this.pool.end();
  }

  static getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.pool;
  }
}

export default DatabaseTestUtils;
