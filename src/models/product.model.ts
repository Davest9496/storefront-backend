import { PoolClient } from 'pg';
import {
  Product,
  ProductWithOrders,
  CreateProductDTO,
  ProductAccessory,
} from '../types/product.types';

export class ProductModel {
  constructor(private client: PoolClient) {}

  async findAll(): Promise<Product[]> {
    const result = await this.client.query<Product>(
      `SELECT id, product_name, price, category, product_desc, features 
       FROM products`
    );
    return result.rows;
  }

  async findById(id: number): Promise<Product | null> {
    const result = await this.client.query<Product>(
      `SELECT id, product_name, price, category, product_desc, features 
       FROM products WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const result = await this.client.query<Product>(
      `SELECT id, product_name, price, category, product_desc, features 
       FROM products WHERE category = $1`,
      [category]
    );
    return result.rows;
  }

  async getTopProducts(): Promise<ProductWithOrders[]> {
    const result = await this.client.query<ProductWithOrders>(
      `SELECT 
        p.id, p.product_name, p.price, p.category, p.product_desc, p.features,
        COALESCE(SUM(op.quantity), 0) as total_ordered
       FROM products p
       LEFT JOIN order_products op ON p.id = op.product_id
       GROUP BY p.id
       ORDER BY total_ordered DESC
       LIMIT 5`
    );
    return result.rows;
  }

  async create(productData: CreateProductDTO): Promise<number> {
    const result = await this.client.query<{ id: number }>(
      `INSERT INTO products (product_name, price, category, product_desc, features)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        productData.product_name,
        productData.price,
        productData.category,
        productData.product_desc,
        productData.features,
      ]
    );
    return result.rows[0].id;
  }

  async getAccessories(
    productIds: number[]
  ): Promise<{ [key: number]: ProductAccessory[] }> {
    const result = await this.client.query<{
      product_id: number;
      accessories: ProductAccessory[];
    }>(
      `SELECT 
        product_id,
        json_agg(
          json_build_object(
            'item_name', item_name,
            'quantity', quantity
          )
        ) as accessories
       FROM product_accessories
       WHERE product_id = ANY($1::int[])
       GROUP BY product_id`,
      [productIds]
    );

    return result.rows.reduce(
      (acc, row) => {
        acc[row.product_id] = row.accessories;
        return acc;
      },
      {} as { [key: number]: ProductAccessory[] }
    );
  }

  async addAccessory(
    productId: number,
    accessory: ProductAccessory
  ): Promise<void> {
    await this.client.query(
      `INSERT INTO product_accessories (product_id, item_name, quantity)
       VALUES ($1, $2, $3)`,
      [productId, accessory.item_name, accessory.quantity]
    );
  }
}
