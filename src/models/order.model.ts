import { QueryResult } from 'pg';
import { query } from '../config/database.config';
import { Order, OrderProduct, OrderStatus } from '../types/shared.types';

export class OrderStore {
  // Create a new order
  async create(userId: number): Promise<Order> {
    try {
      const sql = `
        INSERT INTO orders (user_id, status)
        VALUES ($1, 'active')
        RETURNING *`;

      const result: QueryResult<Order> = await query(sql, [userId]);
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not create order. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Add product to order
  async addProduct(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<OrderProduct> {
    try {
      // First verify if order exists and is still active
      const orderSql = 'SELECT status FROM orders WHERE id = $1';
      const orderResult = await query<Order>(orderSql, [orderId]);

      if (!orderResult.rows.length) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (orderResult.rows[0].status !== 'active') {
        throw new Error(`Cannot add products to completed order ${orderId}`);
      }

      // Then add the product
      const sql = `
        INSERT INTO order_products (order_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING *`;

      const result = await query<OrderProduct>(sql, [
        orderId,
        productId,
        quantity,
      ]);
      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not add product ${productId} to order ${orderId}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Get all orders
  async index(): Promise<Order[]> {
    try {
      const sql = `
        SELECT o.*, 
          json_agg(
            json_build_object(
              'product_id', op.product_id,
              'quantity', op.quantity
            )
          ) as products
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        GROUP BY o.id
        ORDER BY o.id DESC`;

      const result = await query<Order>(sql);
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get orders. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Get specific order
  async show(id: number): Promise<Order | null> {
    try {
      const sql = `
        SELECT o.*, 
          json_agg(
            json_build_object(
              'product_id', op.product_id,
              'quantity', op.quantity
            )
          ) as products
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        WHERE o.id = $1
        GROUP BY o.id`;

      const result = await query<Order>(sql, [id]);
      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      throw new Error(
        `Could not find order ${id}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Get current order by user
  async getCurrentOrder(userId: number): Promise<Order | null> {
    try {
      const sql = `
        SELECT o.*, 
          json_agg(
            json_build_object(
              'product_id', op.product_id,
              'quantity', op.quantity
            )
          ) as products
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        WHERE o.user_id = $1 AND o.status = 'active'
        GROUP BY o.id`;

      const result = await query<Order>(sql, [userId]);
      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      throw new Error(
        `Could not get current order for user ${userId}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Get completed orders by user
  async getCompletedOrders(userId: number): Promise<Order[]> {
    try {
      const sql = `
        SELECT o.*, 
          json_agg(
            json_build_object(
              'product_id', op.product_id,
              'quantity', op.quantity
            )
          ) as products
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.order_id
        WHERE o.user_id = $1 AND o.status = 'complete'
        GROUP BY o.id
        ORDER BY o.id DESC`;

      const result = await query<Order>(sql, [userId]);
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get completed orders for user ${userId}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Update order status
  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    try {
      const sql = `
        UPDATE orders
        SET status = $2
        WHERE id = $1
        RETURNING *`;

      const result = await query<Order>(sql, [id, status]);

      if (!result.rows.length) {
        throw new Error(`Order ${id} not found`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not update order ${id} status. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Update product quantity in order
  async updateProductQuantity(
    orderId: number,
    productId: number,
    quantity: number
  ): Promise<OrderProduct> {
    try {
      // First verify order is still active
      const orderSql = 'SELECT status FROM orders WHERE id = $1';
      const orderResult = await query<Order>(orderSql, [orderId]);

      if (!orderResult.rows.length) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (orderResult.rows[0].status !== 'active') {
        throw new Error(`Cannot modify completed order ${orderId}`);
      }

      const sql = `
        UPDATE order_products
        SET quantity = $3
        WHERE order_id = $1 AND product_id = $2
        RETURNING *`;

      const result = await query<OrderProduct>(sql, [
        orderId,
        productId,
        quantity,
      ]);

      if (!result.rows.length) {
        throw new Error(`Product ${productId} not found in order ${orderId}`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not update product ${productId} quantity in order ${orderId}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Remove product from order
  async removeProduct(orderId: number, productId: number): Promise<void> {
    try {
      // First verify order is still active
      const orderSql = 'SELECT status FROM orders WHERE id = $1';
      const orderResult = await query<Order>(orderSql, [orderId]);

      if (!orderResult.rows.length) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (orderResult.rows[0].status !== 'active') {
        throw new Error(`Cannot modify completed order ${orderId}`);
      }

      const sql = `
        DELETE FROM order_products
        WHERE order_id = $1 AND product_id = $2
        RETURNING *`;

      const result = await query<OrderProduct>(sql, [orderId, productId]);

      if (!result.rows.length) {
        throw new Error(`Product ${productId} not found in order ${orderId}`);
      }
    } catch (err) {
      throw new Error(
        `Could not remove product ${productId} from order ${orderId}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Delete order
  async delete(id: number): Promise<void> {
    try {
      const sql = 'DELETE FROM orders WHERE id = $1 RETURNING *';
      const result = await query<Order>(sql, [id]);

      if (!result.rows.length) {
        throw new Error(`Order ${id} not found`);
      }
    } catch (err) {
      throw new Error(
        `Could not delete order ${id}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
