"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.getTopProducts = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const server_1 = require("../server");
const getProducts = async (_req, res) => {
    try {
        const client = await server_1.dbPool.connect();
        try {
            const result = await client.query('SELECT id, product_name, price, category, product_desc, image_name, product_features, product_accessories FROM products');
            res.json(result.rows);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const client = await server_1.dbPool.connect();
        try {
            const result = await client.query('SELECT id, product_name, price, category, product_desc, image_name, product_features, product_accessories FROM products WHERE id = $1', [productId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            res.json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductById = getProductById;
//-- Reserved for Admin, not implemented yet --//
const createProduct = async (req, res) => {
    try {
        const { product_name, price, category, product_desc, image_name, product_features, product_accessories, } = req.body;
        // Validate required fields
        if (!product_name || !price || !category || !image_name) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Validate price is positive
        if (price <= 0) {
            res.status(400).json({ error: 'Price must be greater than 0' });
            return;
        }
        // Validate category is one of the allowed values
        const validCategories = ['headphones', 'speakers', 'earphones'];
        if (!validCategories.includes(category)) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const result = await client.query(`INSERT INTO products 
                (product_name, price, category, product_desc, image_name, product_features, product_accessories)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, product_name, price, category, product_desc, image_name, product_features, product_accessories`, [
                product_name,
                price,
                category,
                product_desc,
                image_name,
                product_features,
                product_accessories,
            ]);
            res.status(201).json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProduct = createProduct;
const getTopProducts = async (_req, res) => {
    try {
        const client = await server_1.dbPool.connect();
        try {
            // Get top 5 products based on order quantity
            const result = await client.query(`SELECT 
                    p.id,
                    p.product_name,
                    p.price,
                    p.category,
                    p.product_desc,
                    p.image_name,
                    p.product_features,
                    p.product_accessories,
                    COALESCE(SUM(op.quantity), 0) as total_ordered
                FROM products p
                LEFT JOIN order_products op ON p.id = op.product_id
                GROUP BY p.id
                ORDER BY total_ordered DESC
                LIMIT 5`);
            res.json(result.rows);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTopProducts = getTopProducts;
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        // Validate category
        const validCategories = ['headphones', 'speakers', 'earphones'];
        if (!validCategories.includes(category)) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const result = await client.query(`SELECT 
                    id, 
                    product_name,
                    price,
                    category,
                    product_desc,
                    image_name,
                    product_features,
                    product_accessories
                FROM products
                WHERE category = $1`, [category]);
            res.json(result.rows);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductsByCategory = getProductsByCategory;
//# sourceMappingURL=product.handler.js.map