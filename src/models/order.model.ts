import { PoolClient } from 'pg';
import { Order, OrderProduct, OrderStatus } from '../types/order.types';

export class OrderModel {
  constructor(private client: PoolClient) {}

  async findActiveOrder(userId: number): Promise<Order | null> {
    const result = await this.client.query(
      `SELECT 
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
      GROUP BY o.id`,
      [userId]
    );

    return result.rows[0] || null;
  }

  async findCompletedOrders(userId: number): Promise<Order[]> {
    const result = await this.client.query(
      `SELECT 
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
      GROUP BY o.id`,
      [userId]
    );

    return result.rows;
  }

  async create(userId: number): Promise<number> {
    const result = await this.client.query(
      'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id',
      [userId, 'active']
    );
    return result.rows[0].id;
  }

  async addProduct(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<void> {
    await this.client.query(
      'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)',
      [orderId, productId, quantity]
    );
  }

  async findById(orderId: number): Promise<Order | null> {
    const result = await this.client.query(
      `SELECT 
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
      GROUP BY o.id`,
      [orderId]
    );

    return result.rows[0] || null;
  }

  async updateStatus(
    orderId: number,
    status: OrderStatus['status']
  ): Promise<Order | null> {
    const result = await this.client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status',
      [status, orderId]
    );

    return result.rows[0] || null;
  }
}
