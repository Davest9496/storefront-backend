// src/services/order.service.ts
import { PoolClient } from 'pg';
import {
  CreateOrderDTO,
  Order,
  OrderProduct,
  OrderStatus,
} from '../types/order.types';

export class OrderService {
  constructor(private client: PoolClient) {}

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    try {
      await this.client.query('BEGIN');

      // Create the order
      const orderResult = await this.client.query(
        'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id',
        [orderData.userId, 'active']
      );
      const orderId = orderResult.rows[0].id;

      // Add products to order
      for (const product of orderData.products) {
        await this.client.query(
          'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)',
          [orderId, product.productId, product.quantity]
        );
      }

      await this.client.query('COMMIT');

      // Return the created order
      const order = await this.getCurrentOrder(orderData.userId);
      if (!order) {
        throw new Error('Failed to create order');
      }
      return order;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async getCurrentOrder(userId: number): Promise<Order | null> {
    const result = await this.client.query(
      `SELECT 
        o.id as order_id,
        o.user_id,
        o.status,
        json_agg(
          json_build_object(
            'id', op.id,
            'product_id', op.product_id,
            'quantity', op.quantity
          )
        ) as products
      FROM orders o
      LEFT JOIN order_products op ON o.id = op.order_id
      WHERE o.user_id = $1 AND o.status = 'active'
      GROUP BY o.id`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];
    return {
      id: order.order_id,
      user_id: order.user_id,
      status: order.status,
      products: order.products || [],
    };
  }

  async getCompletedOrders(userId: number): Promise<Order[]> {
    const result = await this.client.query(
      `SELECT 
        o.id as order_id,
        o.user_id,
        o.status,
        json_agg(
          json_build_object(
            'id', op.id,
            'product_id', op.product_id,
            'quantity', op.quantity
          )
        ) as products
      FROM orders o
      LEFT JOIN order_products op ON o.id = op.order_id
      WHERE o.user_id = $1 AND o.status = 'complete'
      GROUP BY o.id`,
      [userId]
    );

    return result.rows.map((order) => ({
      id: order.order_id,
      user_id: order.user_id,
      status: order.status,
      products: order.products || [],
    }));
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<boolean> {
    const result = await this.client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id',
      [status, orderId]
    );

    return result.rows.length > 0;
  }
}
