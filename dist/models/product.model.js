"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
class ProductModel {
    constructor(client) {
        this.client = client;
    }
    async findAll() {
        const result = await this.client.query(`SELECT id, product_name, price, category, product_desc, features 
       FROM products`);
        return result.rows;
    }
    async findById(id) {
        const result = await this.client.query(`SELECT id, product_name, price, category, product_desc, features 
       FROM products WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }
    async findByCategory(category) {
        const result = await this.client.query(`SELECT id, product_name, price, category, product_desc, features 
       FROM products WHERE category = $1`, [category]);
        return result.rows;
    }
    async getTopProducts() {
        const result = await this.client.query(`SELECT 
        p.id, p.product_name, p.price, p.category, p.product_desc, p.features,
        COALESCE(SUM(op.quantity), 0) as total_ordered
       FROM products p
       LEFT JOIN order_products op ON p.id = op.product_id
       GROUP BY p.id
       ORDER BY total_ordered DESC
       LIMIT 5`);
        return result.rows;
    }
    async create(productData) {
        const result = await this.client.query(`INSERT INTO products (product_name, price, category, product_desc, features)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`, [
            productData.product_name,
            productData.price,
            productData.category,
            productData.product_desc,
            productData.features,
        ]);
        return result.rows[0].id;
    }
    async getAccessories(productIds) {
        const result = await this.client.query(`SELECT 
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
        return result.rows.reduce((acc, row) => {
            acc[row.product_id] = row.accessories;
            return acc;
        }, {});
    }
    async addAccessory(productId, accessory) {
        await this.client.query(`INSERT INTO product_accessories (product_id, item_name, quantity)
       VALUES ($1, $2, $3)`, [productId, accessory.item_name, accessory.quantity]);
    }
}
exports.ProductModel = ProductModel;
//# sourceMappingURL=product.model.js.map