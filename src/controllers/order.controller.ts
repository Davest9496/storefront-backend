import { Request, Response } from 'express';
import { Pool } from 'pg';
import { OrderStore } from '../models/order.model';
import { CreateOrderDTO, CreateOrderProductDTO } from '../types';
import client from '../config/database.config';

export class OrderController {
  private store: OrderStore;

  constructor(dbClient: Pool = client) {
    this.store = new OrderStore(dbClient);
  }

  async getCurrentOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const order = await this.store.getCurrentOrder(userId);
      if (!order) {
        res.status(404).json({ message: 'No active order found' });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error('Error getting current order:', error);
      res.status(500).json({
        error: 'Could not retrieve current order',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCompletedOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const orders = await this.store.getCompletedOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error getting completed orders:', error);
      res.status(500).json({
        error: 'Could not retrieve completed orders',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const orderData: CreateOrderDTO = {
        user_id: req.user.id,
        status: 'active',
      };

      const newOrder = await this.store.create(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        error: 'Could not create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async addProduct(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      const orderProduct: CreateOrderProductDTO = {
        order_id: orderId,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
      };

      if (!this.validateOrderProduct(orderProduct)) {
        res.status(400).json({ error: 'Invalid product data' });
        return;
      }

      const result = await this.store.addProduct(orderProduct);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding product to order:', error);
      res.status(500).json({
        error: 'Could not add product to order',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async completeOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }

      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const completedOrder = await this.store.completeOrder(
        orderId,
        req.user.id
      );
      res.json(completedOrder);
    } catch (error) {
      console.error('Error completing order:', error);
      res.status(500).json({
        error: 'Could not complete order',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private validateOrderProduct(data: CreateOrderProductDTO): boolean {
    return !!(
      data.product_id &&
      typeof data.product_id === 'number' &&
      data.quantity &&
      typeof data.quantity === 'number' &&
      data.quantity > 0
    );
  }
}
