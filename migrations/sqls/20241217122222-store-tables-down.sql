-- Drop Indexes
DROP INDEX IF EXISTS idx_order_products_product_id;
DROP INDEX IF EXISTS idx_order_products_order_id;
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_orders_user_id;

-- Drop Order_Products Table
DROP TABLE IF EXISTS order_products;

-- Drop Orders Table
DROP TABLE IF EXISTS orders;

-- Drop Products Table
DROP TABLE IF EXISTS products;

-- Drop Users Table
DROP TABLE IF EXISTS users;

-- Drop Enums
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS product_category;