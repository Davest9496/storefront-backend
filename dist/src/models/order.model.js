"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
class OrderModel {
    constructor(client) {
        this.client = client;
    }
    async getCurrentOrder(userId) {
        const orderResult = await this.client.query(`SELECT id, user_id, status 
       FROM orders 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY id DESC 
       LIMIT 1`, [userId]);
        if (!orderResult.rows.length)
            return null;
        const order = orderResult.rows[0];
        const productsResult = await this.client.query(`SELECT 
        op.id, op.product_id, op.quantity,
        p.product_name, p.price, p.category, p.features, p.product_desc
       FROM order_products op
       JOIN products p ON op.product_id = p.id
       WHERE op.order_id = $1`, [order.id]);
        const orderProducts = productsResult.rows.map((row) => ({
            id: row.id,
            product_id: row.product_id,
            quantity: row.quantity,
            product: {
                id: row.product_id,
                product_name: row.product_name,
                price: row.price,
                category: row.category,
                features: row.features,
                product_desc: row.product_desc,
            },
        }));
        return {
            ...order,
            products: orderProducts,
        };
    }
    async getCompletedOrders(userId) {
        const result = await this.client.query(`SELECT 
        o.id, o.user_id, o.status,
        COALESCE(json_agg(
          json_build_object(
            'id', op.id,
            'product_id', op.product_id,
            'quantity', op.quantity,
            'product', json_build_object(
              'id', p.id,
              'product_name', p.product_name,
              'price', p.price,
              'category', p.category::text::product_category,
              'features', p.features,
              'product_desc', p.product_desc
            )
          ) FILTER (WHERE op.id IS NOT NULL)
        ), '[]') as products
       FROM orders o
       LEFT JOIN order_products op ON o.id = op.order_id
       LEFT JOIN products p ON op.product_id = p.id
       WHERE o.user_id = $1 AND o.status = 'complete'
       GROUP BY o.id`, [userId]);
        return result.rows;
    }
    async create(orderData) {
        const result = await this.client.query(`INSERT INTO orders (user_id, status)
       VALUES ($1, 'active')
       RETURNING id`, [orderData.userId]);
        return result.rows[0].id;
    }
    async addProducts(orderId, products) {
        const values = products
            .map((p, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
            .join(',');
        const params = [
            orderId,
            ...products.flatMap((p) => [p.productId, p.quantity]),
        ];
        await this.client.query(`INSERT INTO order_products (order_id, product_id, quantity)
       VALUES ${values}`, params);
    }
    async updateStatus(orderId, status) {
        const result = await this.client.query(`UPDATE orders 
       SET status = $2
       WHERE id = $1
       RETURNING id`, [orderId, status]);
        return result.rows.length > 0;
    }
}
exports.OrderModel = OrderModel;
//# sourceMappingURL=order.model.js.map