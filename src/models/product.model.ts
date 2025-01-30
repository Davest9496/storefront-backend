import { Pool } from 'pg';
import { Product, CreateProductDTO, ProductCategory } from '../types';

export class ProductStore {
  constructor(private client: Pool) {}

  // Convert database row to Product type, handling price conversion
  private convertProduct(row: Record<string, unknown>): Product {
    return {
      ...row,
      price: parseFloat(row.price as string),
      product_features: row.product_features as string[],
      product_accessories: row.product_accessories as string[],
    } as Product;
  }

  async create(product: CreateProductDTO): Promise<Product> {
    try {
      const sql = `
                INSERT INTO products (
                    product_name, price, category, product_desc, 
                    image_name, product_features, product_accessories
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `;

      const conn = await this.client.connect();
      const result = await conn.query(sql, [
        product.product_name,
        product.price,
        product.category,
        product.product_desc || '', // Handle optional field
        product.image_name,
        product.product_features,
        product.product_accessories,
      ]);
      conn.release();

      return this.convertProduct(result.rows[0]);
    } catch (err) {
      throw new Error(`Could not add new product. Error: ${err}`);
    }
  }

  async index(): Promise<Product[]> {
    try {
      const sql = 'SELECT * FROM products ORDER BY id';
      const conn = await this.client.connect();
      const result = await conn.query(sql);
      conn.release();

      return result.rows.map((row) => this.convertProduct(row));
    } catch (err) {
      throw new Error(`Could not get products. Error: ${err}`);
    }
  }

  async show(id: number): Promise<Product> {
    try {
      const sql = 'SELECT * FROM products WHERE id = $1';
      const conn = await this.client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`Product with id ${id} not found`);
      }

      return this.convertProduct(result.rows[0]);
    } catch (err) {
      throw new Error(`Could not find product ${id}. Error: ${err}`);
    }
  }

  async getByCategory(category: ProductCategory): Promise<Product[]> {
    try {
      const sql = 'SELECT * FROM products WHERE category = $1';
      const conn = await this.client.connect();
      const result = await conn.query(sql, [category]);
      conn.release();

      return result.rows.map((row) => this.convertProduct(row));
    } catch (err) {
      throw new Error(
        `Could not get products by category ${category}. Error: ${err}`
      );
    }
  }

  async getPopularProducts(limit: number = 5): Promise<Product[]> {
    try {
      const sql = `
                SELECT p.*, COALESCE(SUM(op.quantity), 0) as total_quantity
                FROM products p
                LEFT JOIN order_products op ON p.id = op.product_id
                GROUP BY p.id
                ORDER BY total_quantity DESC
                LIMIT $1
            `;

      const conn = await this.client.connect();
      const result = await conn.query(sql, [limit]);
      conn.release();

      return result.rows.map((row) => this.convertProduct(row));
    } catch (err) {
      throw new Error(`Could not get popular products. Error: ${err}`);
    }
  }
}
