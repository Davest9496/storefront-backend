-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password_digest VARCHAR(250) NOT NULL
)

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(250),
    category VARCHAR(100) NOT NULL, -- add category list
    product_info VARCHAR(250)
)

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
    order_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'complete'))
)

-- Order_Product Table
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id)
    product_id INTEGER REFERENCES products(id)
    quantity INTEGER NOT NULL
)