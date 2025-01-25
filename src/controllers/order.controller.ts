import { Request, Response } from 'express';
import { dbPool } from '../server';
import { OrderService } from '../services/order.service';
import { CreateOrderDTO, OrderStatus } from '../types/order.types';

export class OrderController {
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

      res.json(order);
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
      res.json(orders);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async createOrder(req: Request, res: Response): Promise<void> {
    const orderData: CreateOrderDTO = req.body;

    if (!orderData.userId || !orderData.products?.length) {
      res.status(400).json({ error: 'Invalid order data' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const orderService = new OrderService(client);
      const orderId = await orderService.createOrder(orderData);
      const newOrder = await orderService.getCurrentOrder(orderData.userId);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const orderId = parseInt(req.params.id);
    const status = req.body.status as OrderStatus;

    if (isNaN(orderId) || !['active', 'complete'].includes(status)) {
      res.status(400).json({ error: 'Invalid order ID or status' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const orderService = new OrderService(client);
      const success = await orderService.updateOrderStatus(orderId, status);

      if (!success) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
}
