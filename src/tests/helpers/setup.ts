import dotenv from 'dotenv';
import client from '../../config/database.config';

dotenv.config();

// Reset test database before all tests
beforeAll(async () => {
  try {
    const conn = await client.connect();

    // Drop existing tables and recreate schema
    await conn.query(`
            DROP TABLE IF EXISTS order_products CASCADE;
            DROP TABLE IF EXISTS orders CASCADE;
            DROP TABLE IF EXISTS products CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TYPE IF EXISTS order_status CASCADE;
            DROP TYPE IF EXISTS product_category CASCADE;
        `);

    // Create types and tables (copy your schema.sql content here)
    await conn.query(`
            CREATE TYPE order_status AS ENUM ('active', 'complete');
            CREATE TYPE product_category AS ENUM ('headphones', 'speakers', 'earphones');
            
            -- Create Users table
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_digest VARCHAR(250) NOT NULL
            );

            -- Create Products table
            CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                product_name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL CHECK (price > 0),
                category product_category NOT NULL,
                product_desc VARCHAR(250),
                image_name VARCHAR(255) NOT NULL,
                product_features TEXT[],
                product_accessories TEXT[]
            );

            -- Create Orders table
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                status order_status NOT NULL DEFAULT 'active',
                CONSTRAINT fk_user 
                    FOREIGN KEY (user_id) 
                    REFERENCES users(id) 
                    ON DELETE CASCADE
            );

            -- Create Order_Products join table
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
            );
        `);

    conn.release();
  } catch (error) {
    throw new Error(`Error setting up test database: ${error}`);
  }
});

// Clean up after all tests
afterAll(async () => {
  const conn = await client.connect();
  try {
    await conn.query('DROP TABLE IF EXISTS order_products CASCADE');
    await conn.query('DROP TABLE IF EXISTS orders CASCADE');
    await conn.query('DROP TABLE IF EXISTS products CASCADE');
    await conn.query('DROP TABLE IF EXISTS users CASCADE');
    await conn.query('DROP TYPE IF EXISTS order_status CASCADE');
    await conn.query('DROP TYPE IF EXISTS product_category CASCADE');
  } finally {
    conn.release();
    await client.end();
  }
});
