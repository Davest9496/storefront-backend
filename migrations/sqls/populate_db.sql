-- Start a transaction to ensure all-or-nothing population
BEGIN;

-- Clean up any existing data to avoid conflicts
TRUNCATE TABLE order_products CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE users CASCADE;

-- Populate Users table with test data
INSERT INTO users (first_name, last_name, email, password_digest) VALUES
('John', 'Doe', 'john.doe@example.com', '$2b$10$xPPQQUB4gRTJK9BLON5e7.f6jpZBu0WJQAqJ0VLrDsQHnHrB8KDtC'),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$10$xPPQQUB4gRTJK9BLON5e7.1234567890abcdefghijklmnopqrstuv');

-- Populate Products table with headphones
INSERT INTO products (product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'XX99 Mark II Headphones',
    259.99,
    'headphones',
    'The new XX99 Mark II headphones is the pinnacle of pristine audio.',
    'xx99-mark-2-headphones',
    ARRAY[
        'Featuring a genuine leather head strap and premium earcups',
        'Advanced Active Noise Cancellation with built-in equalizer'
    ],
    ARRAY[
        'Headphone Unit',
        'Replacement Earcups',
        'User Manual',
        '3.5mm Audio Cable',
        'Travel Bag'
    ]
);

INSERT INTO products (product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'XX99 Mark I Headphones',
    205.00,
    'headphones',
    'As the gold standard for headphones, the classic XX99 Mark I offers detailed audio reproduction.',
    'xx99-mark-1-headphones',
    ARRAY[
        'Comfortable fit with padded headband and earcups',
        'Excellent sound isolation and balanced profile'
    ],
    ARRAY[
        'Headphone Unit',
        'Replacement Earcups',
        'User Manual',
        '3.5mm Audio Cable',
        'Carrying Case'
    ]
);

-- Populate Products table with speakers
INSERT INTO products (product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'ZX9 Speaker',
    345.00,
    'speakers',
    'Upgrade your sound system with the all new ZX9 active speaker.',
    'zx9-speaker',
    ARRAY[
        'Powerful sound experience with high-fidelity drivers',
        'Advanced acoustic design with wireless connectivity'
    ],
    ARRAY[
        'Speaker Units',
        'Remote Control',
        'User Manual',
        'Power Cable',
        'Speaker Stands'
    ]
);

-- Populate Products table with earphones
INSERT INTO products (product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'YX1 Wireless Earphones',
    99.99,
    'earphones',
    'Tailor your listening experience with bespoke dynamic drivers.',
    'yx1-earphones',
    ARRAY[
        'Comfortable and secure fit with ergonomic design',
        'Active noise cancellation with long battery life'
    ],
    ARRAY[
        'Earphone Unit',
        'Ear Tips (S/M/L)',
        'Charging Case',
        'USB-C Cable',
        'User Manual'
    ]
);

-- Create some sample orders
-- Active order for John Doe
INSERT INTO orders (user_id, status) 
SELECT id, 'active' FROM users WHERE email = 'john.doe@example.com';

-- Add products to John's active order
WITH user_order AS (
    SELECT o.id as order_id 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE u.email = 'john.doe@example.com' AND o.status = 'active'
)
INSERT INTO order_products (order_id, product_id, quantity)
SELECT 
    (SELECT order_id FROM user_order),
    p.id,
    2
FROM products p
WHERE p.product_name = 'XX99 Mark II Headphones';

-- Completed order for Jane Smith
INSERT INTO orders (user_id, status)
SELECT id, 'complete' FROM users WHERE email = 'jane.smith@example.com';

-- Add products to Jane's completed order
WITH user_order AS (
    SELECT o.id as order_id 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE u.email = 'jane.smith@example.com' AND o.status = 'complete'
)
INSERT INTO order_products (order_id, product_id, quantity)
SELECT 
    (SELECT order_id FROM user_order),
    p.id,
    1
FROM products p
WHERE p.product_name IN ('ZX9 Speaker', 'YX1 Wireless Earphones');

-- Verify the data was inserted correctly
SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Products count: ' || COUNT(*) FROM products;
SELECT 'Orders count: ' || COUNT(*) FROM orders;
SELECT 'Order Products count: ' || COUNT(*) FROM order_products;

-- If everything succeeded, commit the transaction
COMMIT;