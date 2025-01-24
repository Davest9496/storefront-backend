"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.getTopProducts = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const server_1 = require("../server");
// This helper function efficiently retrieves accessories for multiple products in a single query
// using Postgres' json_agg and json_build_object for structured data return
const getAccessoriesForProducts = async (client, productIds) => {
    const accessoryResult = await client.query(`SELECT 
      product_id,
      json_agg(
        json_build_object(
          'item_name', item_name,
          'quantity', quantity
        )
      ) as accessories
    FROM product_accessories
    WHERE product_id = ANY($1::int[])
    GROUP BY product_id`, [productIds]);
    // Transform the results into a map for easier lookup
    return accessoryResult.rows.reduce((acc, row) => {
        acc[row.product_id] = row.accessories;
        return acc;
    }, {});
};
// Retrieve all products with their basic information
const getProducts = async (_req, res) => {
    try {
        const client = await server_1.dbPool.connect();
        try {
            const productsResult = await client.query(`SELECT 
          id, 
          product_name, 
          price, 
          category, 
          product_desc, 
          features 
        FROM products`);
            if (productsResult.rows.length > 0) {
                // Get accessories for all products in a single query
                const productIds = productsResult.rows.map((product) => product.id);
                const accessoriesMap = await getAccessoriesForProducts(client, productIds);
                // Add accessories to each product
                productsResult.rows = productsResult.rows.map((product) => ({
                    ...product,
                    accessories: accessoriesMap[product.id] || [],
                }));
            }
            res.json(productsResult.rows);
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
// Retrieve a single product by ID with its accessories
const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            res.status(400).json({ error: 'Invalid product ID' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const productResult = await client.query(`SELECT 
          id, 
          product_name, 
          price, 
          category, 
          product_desc, 
          features 
        FROM products 
        WHERE id = $1`, [productId]);
            if (productResult.rows.length === 0) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            // Get accessories for this product
            const accessoriesMap = await getAccessoriesForProducts(client, [
                productId,
            ]);
            const product = {
                ...productResult.rows[0],
                accessories: accessoriesMap[productId] || [],
            };
            res.json(product);
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
// Create a new product with its accessories
const createProduct = async (req, res) => {
    const client = await server_1.dbPool.connect();
    try {
        await client.query('BEGIN');
        const { product_name, price, category, product_desc, features, accessories, } = req.body;
        // Validate required fields
        if (!product_name || !price || !category) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Validate price
        if (price <= 0) {
            res.status(400).json({ error: 'Price must be greater than 0' });
            return;
        }
        // Validate category
        const validCategories = [
            'headphones',
            'speakers',
            'earphones',
        ];
        if (!validCategories.includes(category)) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        // Insert the product
        const productResult = await client.query(`INSERT INTO products 
        (product_name, price, category, product_desc, features)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`, [product_name, price, category, product_desc, features]);
        const productId = productResult.rows[0].id;
        // Insert accessories if provided
        if (accessories.length > 0) {
            for (const accessory of accessories) {
                await client.query(`INSERT INTO product_accessories 
            (product_id, item_name, quantity)
            VALUES ($1, $2, $3)`, [productId, accessory.item_name, accessory.quantity]);
            }
        }
        await client.query('COMMIT');
        // Return the created product with its accessories
        await (0, exports.getProductById)({ params: { id: productId.toString() } }, res);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.createProduct = createProduct;
// Retrieve the top 5 most ordered products
const getTopProducts = async (_req, res) => {
    try {
        const client = await server_1.dbPool.connect();
        try {
            const productsResult = await client.query(`SELECT 
          p.id,
          p.product_name,
          p.price,
          p.category,
          p.product_desc,
          p.features,
          COALESCE(SUM(op.quantity), 0) as total_ordered
        FROM products p
        LEFT JOIN order_products op ON p.id = op.product_id
        GROUP BY p.id
        ORDER BY total_ordered DESC
        LIMIT 5`);
            if (productsResult.rows.length > 0) {
                const productIds = productsResult.rows.map((product) => product.id);
                const accessoriesMap = await getAccessoriesForProducts(client, productIds);
                productsResult.rows = productsResult.rows.map((product) => ({
                    ...product,
                    accessories: accessoriesMap[product.id] || [],
                }));
            }
            res.json(productsResult.rows);
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
// Retrieve products by category
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = [
            'headphones',
            'speakers',
            'earphones',
        ];
        if (!validCategories.includes(category)) {
            res.status(400).json({ error: 'Invalid category' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const productsResult = await client.query(`SELECT 
          id, 
          product_name,
          price,
          category,
          product_desc,
          features
        FROM products
        WHERE category = $1`, [category]);
            if (productsResult.rows.length > 0) {
                const productIds = productsResult.rows.map((product) => product.id);
                const accessoriesMap = await getAccessoriesForProducts(client, productIds);
                productsResult.rows = productsResult.rows.map((product) => ({
                    ...product,
                    accessories: accessoriesMap[product.id] || [],
                }));
            }
            res.json(productsResult.rows);
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
//# sourceMappingURL=product.controller.js.map