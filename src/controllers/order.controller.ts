import { Request, Response } from 'express';
import { OrderStore } from '../models/order.model';
import {
  isOrderStatusRequest,
  OrderStatusRequest,
} from '../types/request.types';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  isAppError,
  handleUnknownError,
} from '../utils/error.utils';

export class OrderController {
  private store: OrderStore;

  constructor() {
    this.store = new OrderStore();
  }

  // GET /orders
  getAllOrders = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const orders = await this.store.index();
      return res.json(orders);
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      return res.status(500).json({
        error: 'Failed to fetch orders',
        details: handleUnknownError(error),
      });
    }
  };

  // GET /orders/:id
  getOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      // Check if the user has permission to view this order
      if (req.user && order.user_id !== req.user.id) {
        throw new ForbiddenError(
          'You do not have permission to view this order'
        );
      }

      return res.json(order);
    } catch (error) {
      console.error('Error in getOrder:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to fetch order',
        details: handleUnknownError(error),
      });
    }
  };

  // POST /orders
  createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const newOrder = await this.store.create(req.user.id);
      return res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error in createOrder:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to create order',
        details: handleUnknownError(error),
      });
    }
  };

  // POST /orders/:id/products
  addProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      const { product_id, quantity } = req.body;
      if (!product_id || !quantity) {
        throw new BadRequestError('Product ID and quantity are required');
      }

      // Check if order exists and user has permission
      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      if (req.user && order.user_id !== req.user.id) {
        throw new ForbiddenError(
          'You do not have permission to modify this order'
        );
      }

      // Add product to order
      const result = await this.store.addProduct(orderId, product_id, quantity);
      return res.json(result);
    } catch (error) {
      console.error('Error in addProduct:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to add product to order',
        details: handleUnknownError(error),
      });
    }
  };

  // DELETE /orders/:id
  deleteOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      // First check if order exists and user has permission
      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      if (req.user && order.user_id !== req.user.id) {
        throw new ForbiddenError(
          'You do not have permission to delete this order'
        );
      }

      await this.store.delete(orderId);
      return res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error in deleteOrder:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to delete order',
        details: handleUnknownError(error),
      });
    }
  };

  // PATCH /orders/:id/status
  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      if (!isOrderStatusRequest(req.body)) {
        throw new BadRequestError('Invalid status update request');
      }

      const statusUpdate: OrderStatusRequest = req.body;

      // First check if order exists and user has permission
      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      if (req.user && order.user_id !== req.user.id) {
        throw new ForbiddenError(
          'You do not have permission to update this order'
        );
      }

      const updatedOrder = await this.store.updateStatus(
        orderId,
        statusUpdate.status
      );
      return res.json(updatedOrder);
    } catch (error) {
      console.error('Error in updateStatus:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to update order status',
        details: handleUnknownError(error),
      });
    }
  };

  // GET /orders/user/:userId/current
  getCurrentOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        throw new BadRequestError('Invalid user ID');
      }

      // Check if user is requesting their own order
      if (req.user && userId !== req.user.id) {
        throw new ForbiddenError('You can only view your own current order');
      }

      const currentOrder = await this.store.getCurrentOrder(userId);
      if (!currentOrder) {
        return res.json({ message: 'No active order found' });
      }

      return res.json(currentOrder);
    } catch (error) {
      console.error('Error in getCurrentOrder:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to fetch current order',
        details: handleUnknownError(error),
      });
    }
  };

  // GET /orders/user/:userId/completed
  getCompletedOrders = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        throw new BadRequestError('Invalid user ID');
      }

      // Check if user is requesting their own orders
      if (req.user && userId !== req.user.id) {
        throw new ForbiddenError('You can only view your own completed orders');
      }

      const completedOrders = await this.store.getCompletedOrders(userId);
      return res.json(completedOrders);
    } catch (error) {
      console.error('Error in getCompletedOrders:', error);

      if (isAppError(error)) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to fetch completed orders',
        details: handleUnknownError(error),
      });
    }
  };
}
