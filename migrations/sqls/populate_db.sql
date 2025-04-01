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
INSERT INTO products (id, product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'xx99-mark-two',
    'XX99 Mark II Headphones',
    469.99,
    'headphones',
    'The new XX99 Mark II headphones is the pinnacle of pristine audio. It redefines your premium headphone experience by reproducing the balanced depth and precision of studio-quality sound.',
    'product-xx99-mark-two-headphones',
    ARRAY[
        'Featuring a genuine leather head strap and premium earcups, these headphones deliver superior comfort for those who like to enjoy endless listening. It includes intuitive controls designed for any situation. Whether you are taking a business call or just in your own personal space, the auto on/off and pause features ensure that you will never miss a beat.',
        'The advanced Active Noise Cancellation with built-in equalizer allow you to experience your audio world on your terms. It lets you enjoy your audio in peace, but quickly interact with your surroundings when you need to. Combined with Bluetooth 5.0 compliant connectivity and 17 hour battery life, the XX99 Mark II headphones gives you superior sound, cutting-edge technology, and a modern design aesthetic.'
    ],
    ARRAY[
        '{"quantity": 1, "item": "Headphone Unit"}',
        '{"quantity": 2, "item": "Replacement Earcups"}',
        '{"quantity": 1, "item": "User Manual"}',
        '{"quantity": 1, "item": "3.5mm 5mm Audio Cable"}',
        '{"quantity": 1, "item": "Travel Bag"}'
    ]
);

INSERT INTO products (id, product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'xx99-mark-one',
    'XX99 Mark I Headphones',
    344.99,
    'headphones',
    'As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction for audiophiles, mixing engineers, and music aficionados alike in studios and on the go.',
    'product-xx99-mark-one-headphones',
    ARRAY[
        'The XX99 Mark I headphones offer a comfortable fit with their padded headband and earcups. They provide excellent sound isolation and a balanced sound profile, making them ideal for both casual listening and professional use.',
        'With a durable build and a detachable cable, the XX99 Mark I headphones are designed to last. They come with a carrying case for easy transport and storage.'
    ],
    ARRAY[
        '{"quantity": 1, "item": "Headphone Unit"}',
        '{"quantity": 1, "item": "Replacement Earcups"}',
        '{"quantity": 1, "item": "User Manual"}',
        '{"quantity": 1, "item": "3.5mm Audio Cable"}',
        '{"quantity": 1, "item": "Carrying Case"}'
    ]
);

INSERT INTO products (id, product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'xx59',
    'XX59 Headphones',
    599.99,
    'headphones',
    'Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones. The stylish yet durable versatile wireless headset is a brilliant companion at home or on the move.',
    'product-xx59-headphones',
    ARRAY[
        'The XX59 headphones offer a sleek design and a comfortable fit. They provide a balanced sound profile with deep bass and clear highs, making them suitable for a wide range of music genres.',
        'With a long battery life and Bluetooth connectivity, the XX59 headphones are perfect for on-the-go listening. They also come with a built-in microphone for hands-free calls.'
    ],
    ARRAY[
        '{"quantity": 1, "item": "Headphone Unit"}',
        '{"quantity": 1, "item": "User Manual"}',
        '{"quantity": 1, "item": "3.5mm Audio Cable"}',
        '{"quantity": 1, "item": "Charging Cable"}'
    ]
);

-- Populate Products table with speakers
INSERT INTO products (id, product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'zx9',
    'ZX9 Speaker',
    1045.00,
    'speakers',
    'Upgrade your sound system with the all new ZX9 active speaker. It''s a bookshelf speaker system that offers truly wireless connectivity -- creating new possibilities for more pleasing and practical audio setups.',
    'product-zx9-speakers',
    ARRAY[
        'The ZX9 speaker offers a powerful sound experience with its high-fidelity drivers and advanced acoustic design. It supports wireless connectivity, allowing you to stream music from your devices with ease.',
        'With a sleek and modern design, the ZX9 speaker fits seamlessly into any home decor. It also includes a remote control for convenient operation.'
    ],
    ARRAY[
        '{"quantity": 2, "item": "Speaker Units"}',
        '{"quantity": 1, "item": "Remote Control"}',
        '{"quantity": 1, "item": "User Manual"}',
        '{"quantity": 1, "item": "Power Cable"}',
        '{"quantity": 2, "item": "Speaker Stands"}'
    ]
);

INSERT INTO products (id, product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'zx7',
    'ZX7 Speaker',
    1248.00,
    'speakers',
    'Stream high quality sound wirelessly with minimal loss. The ZX7 bookshelf speaker uses high-end audiophile components that represents the top of the line powered speakers for home or studio use.',
    'product-zx7-speakers',
    ARRAY[
        'The ZX7 speaker delivers exceptional sound quality with its high-performance drivers and advanced crossover network. It supports both wired and wireless connections, giving you flexibility in your audio setup.',
        'With a classic design and premium build quality, the ZX7 speaker is a great addition to any audio enthusiast''s collection. It also includes a remote control for easy operation.'
    ],
    ARRAY[
        '{"quantity": 2, "item": "Speaker Units"}',
        '{"quantity": 1, "item": "Remote Control"}',
        '{"quantity": 1, "item": "User Manual"}',
        '{"quantity": 1, "item": "Power Cable"}'
    ]
);

-- Populate Products table with earphones
INSERT INTO products (id, product_name, price, category, product_desc, image_name, product_features, product_accessories) VALUES
(
    'yx1',
    'YX1 Wireless Earphones',
    499.99,
    'earphones',
    'Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones. Enjoy incredible high-fidelity sound even in noisy environments with its active noise cancellation feature.',
    'product-yx1-earphones',
    ARRAY[
        'The YX1 wireless earphones offer a comfortable and secure fit with their ergonomic design and multiple ear tip sizes. They provide high-fidelity sound with deep bass and clear highs, making them perfect for music lovers.',
        'With active noise cancellation and a long battery life, the YX1 earphones let you enjoy your music without distractions. They also come with a charging case for convenient on-the-go charging.'
    ],
    ARRAY[
        '{"quantity": 1, "item": "Earphone Unit"}',
        '{"quantity": 3, "item": "Ear Tip Sizes"}',
        '{"quantity": 1, "item": "User Manual"}',
        '{"quantity": 1, "item": "Charging Case"}',
        '{"quantity": 1, "item": "USB-C Charging Cable"}'
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
    'xx99-mark-two',
    2;

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
VALUES 
    ((SELECT order_id FROM user_order), 'zx9', 1),
    ((SELECT order_id FROM user_order), 'yx1', 1);

-- Verify the data was inserted correctly
SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Products count: ' || COUNT(*) FROM products;
SELECT 'Orders count: ' || COUNT(*) FROM orders;
SELECT 'Order Products count: ' || COUNT(*) FROM order_products;

-- If everything succeeded, commit the transaction
COMMIT;