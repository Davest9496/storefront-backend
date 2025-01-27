import { Router } from 'express';
import { AuthMiddleware } from '../../../src/middleware/auth.middleware';
import { OrderController } from '../../../src/controllers/order.controller';

const orderRouter = Router();

// Create new order
orderRouter.post(
  '/',
  AuthMiddleware.verifyAuthToken,
  OrderController.createOrder
);

// Get current active order for a user
orderRouter.get(
  '/current/:userId',
  AuthMiddleware.verifyAuthToken,
  OrderController.getCurrentOrder
);

// Get completed orders for a user
orderRouter.get(
  '/completed/:userId',
  AuthMiddleware.verifyAuthToken,
  OrderController.getCompletedOrders
);

// Update order status
orderRouter.put(
  '/:id/status',
  AuthMiddleware.verifyAuthToken,
  OrderController.updateOrderStatus
);

export default orderRouter;
