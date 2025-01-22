"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.addProduct = exports.createOrder = exports.getCompletedOrders = exports.getCurrentOrder = void 0;
const server_1 = require("../server");
const getCurrentOrder = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const client = await server_1.dbPool.connect();
        try {
            // Get active order with its products
            const result = await client.query(`SELECT 
                    o.id as order_id,
                    o.user_id,
                    o.status,
                    json_agg(
                        json_build_object(
                            'id', op.id,
                            'product_id', op.product_id,
                            'quantity', op.quantity,
                            'product_name', p.product_name,
                            'price', p.price
                        )
                    ) as products
                FROM orders o
                LEFT JOIN order_products op ON o.id = op.order_id
                LEFT JOIN products p ON op.product_id = p.id
                WHERE o.user_id = $1 AND o.status = 'active'
                GROUP BY o.id`, [userId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'No active order found' });
                return;
            }
            res.json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching current order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCurrentOrder = getCurrentOrder;
const getCompletedOrders = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const client = await server_1.dbPool.connect();
        try {
            const result = await client.query(`SELECT 
                    o.id as order_id,
                    o.user_id,
                    o.status,
                    json_agg(
                        json_build_object(
                            'id', op.id,
                            'product_id', op.product_id,
                            'quantity', op.quantity,
                            'product_name', p.product_name,
                            'price', p.price
                        )
                    ) as products
                FROM orders o
                LEFT JOIN order_products op ON o.id = op.order_id
                LEFT JOIN products p ON op.product_id = p.id
                WHERE o.user_id = $1 AND o.status = 'complete'
                GROUP BY o.id`, [userId]);
            res.json(result.rows);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error fetching completed orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCompletedOrders = getCompletedOrders;
const createOrder = async (req, res) => {
    try {
        const { userId, products } = req.body;
        const client = await server_1.dbPool.connect();
        try {
            await client.query('BEGIN');
            // Create order
            const orderResult = await client.query('INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id', [userId, 'active']);
            const orderId = orderResult.rows[0].id;
            // Add products to order
            for (const product of products) {
                await client.query('INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)', [orderId, product.productId, product.quantity]);
            }
            await client.query('COMMIT');
            // Fetch the complete order
            const result = await client.query(`SELECT 
                    o.id as order_id,
                    o.user_id,
                    o.status,
                    json_agg(
                        json_build_object(
                            'id', op.id,
                            'product_id', op.product_id,
                            'quantity', op.quantity,
                            'product_name', p.product_name,
                            'price', p.price
                        )
                    ) as products
                FROM orders o
                LEFT JOIN order_products op ON o.id = op.order_id
                LEFT JOIN products p ON op.product_id = p.id
                WHERE o.id = $1
                GROUP BY o.id`, [orderId]);
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createOrder = createOrder;
const addProduct = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { productId, quantity } = req.body;
        const client = await server_1.dbPool.connect();
        try {
            // Verify order exists and is active
            const orderCheck = await client.query('SELECT status FROM orders WHERE id = $1', [orderId]);
            if (orderCheck.rows.length === 0) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            if (orderCheck.rows[0].status !== 'active') {
                res.status(400).json({ error: 'Cannot modify completed order' });
                return;
            }
            // Add product to order
            await client.query('INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)', [orderId, productId, quantity]);
            // Fetch updated order
            const result = await client.query(`SELECT 
                    o.id as order_id,
                    o.user_id,
                    o.status,
                    json_agg(
                        json_build_object(
                            'id', op.id,
                            'product_id', op.product_id,
                            'quantity', op.quantity,
                            'product_name', p.product_name,
                            'price', p.price
                        )
                    ) as products
                FROM orders o
                LEFT JOIN order_products op ON o.id = op.order_id
                LEFT JOIN products p ON op.product_id = p.id
                WHERE o.id = $1
                GROUP BY o.id`, [orderId]);
            res.json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error adding product to order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addProduct = addProduct;
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        const client = await server_1.dbPool.connect();
        try {
            const result = await client.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status', [status, orderId]);
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            res.json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=order.handler.js.map