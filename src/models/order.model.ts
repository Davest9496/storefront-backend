import { Pool } from 'pg';
import {
  Order,
  OrderStatus,
  CreateOrderDTO,
  RecentOrder,
  OrderProduct,
  CreateOrderProductDTO,
} from '../types';

export class OrderStore {
  constructor(private client: Pool) {}

  async getCurrentOrder(userId: number): Promise<Order | null> {
    try {
      // Explicitly use OrderStatus type for type safety
      const status: OrderStatus = 'active';
      const sql = `
                SELECT * FROM orders 
                WHERE user_id = $1 AND status = $2
                ORDER BY id DESC 
                LIMIT 1
            `;
      const conn = await this.client.connect();
      const result = await conn.query(sql, [userId, status]);
      conn.release();

      return result.rows[0] || null;
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${userId}. Error: ${err}`
      );
    }
  }

  async create(order: CreateOrderDTO): Promise<Order> {
    try {
      // Ensure status is of type OrderStatus
      const status: OrderStatus = order.status || 'active';
      const sql = `
                INSERT INTO orders (user_id, status)
                VALUES ($1, $2)
                RETURNING *
            `;
      const conn = await this.client.connect();
      const result = await conn.query(sql, [order.user_id, status]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create order. Error: ${err}`);
    }
  }

  async addProduct(orderProduct: CreateOrderProductDTO): Promise<OrderProduct> {
    try {
      // Define expected status for type checking
      const activeStatus: OrderStatus = 'active';
      const orderSql = `
                SELECT status FROM orders WHERE id = $1
            `;
      const conn = await this.client.connect();
      const orderResult = await conn.query(orderSql, [orderProduct.order_id]);

      if (orderResult.rows.length === 0) {
        throw new Error(`Order ${orderProduct.order_id} not found`);
      }

      if (orderResult.rows[0].status !== activeStatus) {
        throw new Error(`Cannot add products to a completed order`);
      }

      const sql = `
                INSERT INTO order_products (order_id, product_id, quantity)
                VALUES ($1, $2, $3)
                RETURNING *
            `;

      const result = await conn.query(sql, [
        orderProduct.order_id,
        orderProduct.product_id,
        orderProduct.quantity,
      ]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add product to order. Error: ${err}`);
    }
  }

  async completeOrder(orderId: number, userId: number): Promise<Order> {
    try {
      // Use OrderStatus type for both status values
      const newStatus: OrderStatus = 'complete';
      const currentStatus: OrderStatus = 'active';

      const sql = `
                UPDATE orders 
                SET status = $1
                WHERE id = $2 AND user_id = $3 AND status = $4
                RETURNING *
            `;
      const conn = await this.client.connect();
      const result = await conn.query(sql, [
        newStatus,
        orderId,
        userId,
        currentStatus,
      ]);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(
          `Could not complete order ${orderId}. Order might not exist, might not belong to user ${userId}, or might already be complete.`
        );
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not complete order ${orderId}. Error: ${err}`);
    }
  }

  async getCompletedOrders(userId: number): Promise<Order[]> {
    try {
      // Use OrderStatus type for the status parameter
      const status: OrderStatus = 'complete';
      const sql = `
                SELECT * FROM orders
                WHERE user_id = $1 AND status = $2
                ORDER BY id DESC
            `;
      const conn = await this.client.connect();
      const result = await conn.query(sql, [userId, status]);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get completed orders for user ${userId}. Error: ${err}`
      );
    }
  }

  async getRecentOrders(userId: number): Promise<RecentOrder[]> {
    try {
      // Using type casting to ensure PostgreSQL treats the status as the correct enum type
      const sql = `
                SELECT 
                    o.id, 
                    o.status::order_status as status,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'product_id', op.product_id,
                                'quantity', op.quantity
                            )
                        ) FILTER (WHERE op.id IS NOT NULL),
                        '[]'
                    ) as products
                FROM orders o
                LEFT JOIN order_products op ON o.id = op.order_id
                WHERE o.user_id = $1
                GROUP BY o.id, o.status
                ORDER BY o.id DESC
                LIMIT 5
            `;

      const conn = await this.client.connect();
      const result = await conn.query<RecentOrder>(sql, [userId]);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get recent orders for user ${userId}. Error: ${err}`
      );
    }
  }
}
