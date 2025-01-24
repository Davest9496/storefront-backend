import { Request, Response } from 'express';
import { dbPool } from '../server';
import { OrderService } from '../services/order.service';
import {
  CreateOrderDTO,
  OrderProduct,
  OrderStatus,
} from '../types/order.types';

export class OrderController {
  static async getCurrentOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const client = await dbPool.connect();

      try {
        const orderService = new OrderService(client);
        const order = await orderService.getCurrentOrder(userId);
        res.json(order);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'No active order found'
        ) {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching current order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getCompletedOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const client = await dbPool.connect();

      try {
        const orderService = new OrderService(client);
        const orders = await orderService.getCompletedOrders(userId);
        res.json(orders);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData: CreateOrderDTO = req.body;
      const client = await dbPool.connect();

      try {
        const orderService = new OrderService(client);
        const order = await orderService.createOrder(orderData);
        res.status(201).json(order);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addProduct(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      const productData: OrderProduct = req.body;
      const client = await dbPool.connect();

      try {
        const orderService = new OrderService(client);
        const order = await orderService.addProduct(orderId, productData);
        res.json(order);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Order not found') {
            res.status(404).json({ error: error.message });
          } else if (error.message === 'Cannot modify completed order') {
            res.status(400).json({ error: error.message });
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding product to order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      const statusData: OrderStatus = req.body;
      const client = await dbPool.connect();

      try {
        const orderService = new OrderService(client);
        const order = await orderService.updateOrderStatus(orderId, statusData);
        res.json(order);
      } catch (error) {
        if (error instanceof Error && error.message === 'Order not found') {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
