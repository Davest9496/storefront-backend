-- Start a transaction to ensure all-or-nothing population
BEGIN;

-- Clean up any existing data to avoid conflicts
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE order_products CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE product_accessories CASCADE;
TRUNCATE TABLE products CASCADE;

-- Users
INSERT INTO users (first_name, last_name, email, password_digest) VALUES
(
    'John',
    'Doe',
    'john.doe@example.com',
    -- This represents 'password123'
    '$2b$10$xPPQQUB4gRTJK9BLON5e7.f6jpZBu0WJQAqJ0VLrDsQHnHrB8KDtC'
),
(
    'Jane',
    'Smith',
    'jane.smith@example.com',
    -- This represents 'testpass456'
    '$2b$10$xPPQQUB4gRTJK9BLON5e7.1234567890abcdefghijklmnopqrstuv'
);

-- Headphones Category
INSERT INTO products (product_name, price, category, product_desc, features) VALUES
(
    'XX99 Mark II Headphones',
    259.99,
    'headphones',
    'The new XX99 Mark II headphones is the pinnacle of pristine audio. It redefines your premium headphone experience by reproducing the balanced depth and precision of studio-quality sound.',
    ARRAY[
        'Featuring a genuine leather head strap and premium earcups, these headphones deliver superior comfort for those who like to enjoy endless listening. It includes intuitive controls designed for any situation. Whether you are taking a business call or just in your own personal space, the auto on/off and pause features ensure that you will never miss a beat.',
        'The advanced Active Noise Cancellation with built-in equalizer allow you to experience your audio world on your terms. It lets you enjoy your audio in peace, but quickly interact with your surroundings when you need to. Combined with Bluetooth 5.0 compliant connectivity and 17 hour battery life, the XX99 Mark II headphones gives you superior sound, cutting-edge technology, and a modern design aesthetic.'
    ]
);

-- Insert accessories for XX99 Mark II
WITH product_id AS (SELECT id FROM products WHERE product_name = 'XX99 Mark II Headphones')
INSERT INTO product_accessories (product_id, item_name, quantity) VALUES
((SELECT id FROM product_id), 'Headphone Unit', 1),
((SELECT id FROM product_id), 'Replacement Earcups', 2),
((SELECT id FROM product_id), 'User Manual', 1),
((SELECT id FROM product_id), '3.5mm Audio Cable', 1),
((SELECT id FROM product_id), 'Travel Bag', 1);

INSERT INTO products (product_name, price, category, product_desc, features) VALUES
(
    'XX99 Mark I Headphones',
    205.00,
    'headphones',
    'As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction for audiophiles, mixing engineers, and music aficionados alike in studios and on the go.',
    ARRAY[
        'The XX99 Mark I headphones offer a comfortable fit with their padded headband and earcups. They provide excellent sound isolation and a balanced sound profile, making them ideal for both casual listening and professional use.',
        'With a durable build and a detachable cable, the XX99 Mark I headphones are designed to last. They come with a carrying case for easy transport and storage.'
    ]
);

-- Insert accessories for XX99 Mark I
WITH product_id AS (SELECT id FROM products WHERE product_name = 'XX99 Mark I Headphones')
INSERT INTO product_accessories (product_id, item_name, quantity) VALUES
((SELECT id FROM product_id), 'Headphone Unit', 1),
((SELECT id FROM product_id), 'Replacement Earcups', 1),
((SELECT id FROM product_id), 'User Manual', 1),
((SELECT id FROM product_id), '3.5mm Audio Cable', 1),
((SELECT id FROM product_id), 'Carrying Case', 1);

INSERT INTO products (product_name, price, category, product_desc, features) VALUES
(
    'XX59 Headphones',
    195.00,
    'headphones',
    'Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones. The stylish yet durable versatile wireless headset is a brilliant companion at home or on the move.',
    ARRAY[
        'The XX59 headphones offer a sleek design and a comfortable fit. They provide a balanced sound profile with deep bass and clear highs, making them suitable for a wide range of music genres.',
        'With a long battery life and Bluetooth connectivity, the XX59 headphones are perfect for on-the-go listening. They also come with a built-in microphone for hands-free calls.'
    ]
);

-- Insert accessories for XX59
WITH product_id AS (SELECT id FROM products WHERE product_name = 'XX59 Headphones')
INSERT INTO product_accessories (product_id, item_name, quantity) VALUES
((SELECT id FROM product_id), 'Headphone Unit', 1),
((SELECT id FROM product_id), 'User Manual', 1),
((SELECT id FROM product_id), '3.5mm Audio Cable', 1),
((SELECT id FROM product_id), 'Charging Cable', 1);

-- Speakers Category
INSERT INTO products (product_name, price, category, product_desc, features) VALUES
(
    'ZX9 Speaker',
    345.00,
    'speakers',
    'Upgrade your sound system with the all new ZX9 active speaker. It''s a bookshelf speaker system that offers truly wireless connectivity -- creating new possibilities for more pleasing and practical audio setups.',
    ARRAY[
        'The ZX9 speaker offers a powerful sound experience with its high-fidelity drivers and advanced acoustic design. It supports wireless connectivity, allowing you to stream music from your devices with ease.',
        'With a sleek and modern design, the ZX9 speaker fits seamlessly into any home decor. It also includes a remote control for convenient operation.'
    ]
);

-- Insert accessories for ZX9
WITH product_id AS (SELECT id FROM products WHERE product_name = 'ZX9 Speaker')
INSERT INTO product_accessories (product_id, item_name, quantity) VALUES
((SELECT id FROM product_id), 'Speaker Units', 2),
((SELECT id FROM product_id), 'Remote Control', 1),
((SELECT id FROM product_id), 'User Manual', 1),
((SELECT id FROM product_id), 'Power Cable', 1),
((SELECT id FROM product_id), 'Speaker Stands', 2);

INSERT INTO products (product_name, price, category, product_desc, features) VALUES
(
    'ZX7 Speaker',
    248.00,
    'speakers',
    'Stream high quality sound wirelessly with minimal loss. The ZX7 bookshelf speaker uses high-end audiophile components that represents the top of the line powered speakers for home or studio use.',
    ARRAY[
        'The ZX7 speaker delivers exceptional sound quality with its high-performance drivers and advanced crossover network. It supports both wired and wireless connections, giving you flexibility in your audio setup.',
        'With a classic design and premium build quality, the ZX7 speaker is a great addition to any audio enthusiast''s collection. It also includes a remote control for easy operation.'
    ]
);

-- Insert accessories for ZX7
WITH product_id AS (SELECT id FROM products WHERE product_name = 'ZX7 Speaker')
INSERT INTO product_accessories (product_id, item_name, quantity) VALUES
((SELECT id FROM product_id), 'Speaker Units', 2),
((SELECT id FROM product_id), 'Remote Control', 1),
((SELECT id FROM product_id), 'User Manual', 1),
((SELECT id FROM product_id), 'Power Cable', 1);

-- Earphones Category
INSERT INTO products (product_name, price, category, product_desc, features) VALUES
(
    'YX1 Wireless Earphones',
    99.99,
    'earphones',
    'Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones. Enjoy incredible high-fidelity sound even in noisy environments with its active noise cancellation feature.',
    ARRAY[
        'The YX1 wireless earphones offer a comfortable and secure fit with their ergonomic design and multiple ear tip sizes. They provide high-fidelity sound with deep bass and clear highs, making them perfect for music lovers.',
        'With active noise cancellation and a long battery life, the YX1 earphones let you enjoy your music without distractions. They also come with a charging case for convenient on-the-go charging.'
    ]
);

-- Insert accessories for YX1
WITH product_id AS (SELECT id FROM products WHERE product_name = 'YX1 Wireless Earphones')
INSERT INTO product_accessories (product_id, item_name, quantity) VALUES
((SELECT id FROM product_id), 'Earphone Unit', 1),
((SELECT id FROM product_id), 'Ear Tip Sizes', 3),
((SELECT id FROM product_id), 'User Manual', 1),
((SELECT id FROM product_id), 'Charging Case', 1),
((SELECT id FROM product_id), 'USB-C Charging Cable', 1);

-- Verify the data was inserted correctly
SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Products count: ' || COUNT(*) FROM products;
SELECT 'Accessories count: ' || COUNT(*) FROM product_accessories;

-- If everything succeeded, commit the transaction
COMMIT;