import { Request, Response } from 'express';
import { dbPool } from '../server';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../types/order.types';

export class OrderController {
  static async createOrder(req: Request, res: Response): Promise<void> {
    const { user_id, products } = req.body;

    // Validate required fields
    if (!user_id || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Invalid order data' });
      return;
    }

    // Validate products array structure
    const validProducts = products.every(
      (p) => p.product_id && typeof p.quantity === 'number' && p.quantity > 0
    );

    if (!validProducts) {
      res.status(400).json({ error: 'Invalid product data' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const orderService = new OrderService(client);
      const order = await orderService.createOrder({
        userId: user_id,
        products: products,
      });
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async getCurrentOrder(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const orderService = new OrderService(client);
      const order = await orderService.getCurrentOrder(userId);

      if (!order) {
        res.status(404).json({ error: 'No active order found' });
        return;
      }

      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching current order:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async getCompletedOrders(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const orderService = new OrderService(client);
      const orders = await orderService.getCompletedOrders(userId);
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    if (!status || !['active', 'complete'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const orderService = new OrderService(client);
      const success = await orderService.updateOrderStatus(
        orderId,
        status as OrderStatus
      );

      if (!success) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
}
