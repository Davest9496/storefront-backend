-- Type enums
CREATE TYPE order_status AS ENUM ('active', 'complete');
CREATE TYPE product_category AS ENUM ('headphones', 'speakers', 'earphones');

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category product_category NOT NULL,
    product_desc TEXT,
    features TEXT[]
);

-- Product accessories
CREATE TABLE product_accessories (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_digest VARCHAR(250) NOT NULL
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'active',
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Order_Products table
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
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

-- Create Indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_accessories_product ON product_accessories(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_products_order_id ON order_products(order_id);
CREATE INDEX idx_order_products_product_id ON order_products(product_id);
CREATE INDEX idx_users_email ON users(email);