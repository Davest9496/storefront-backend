import { Router } from 'express';
import { OrderController } from '../../controllers/order.controller';
import { verifyAuthToken } from '../../middleware/auth.middleware';

const orderRoutes = Router();
const orderController = new OrderController();

// Get all orders [token required]
orderRoutes.get('/', verifyAuthToken, orderController.getAllOrders);

// Get specific order [token required]
orderRoutes.get('/:id', verifyAuthToken, orderController.getOrder);

// Create new order [token required]
orderRoutes.post('/', verifyAuthToken, orderController.createOrder);

// Add product to order [token required]
orderRoutes.post('/:id/products', verifyAuthToken, orderController.addProduct);

// Delete order [token required]
orderRoutes.delete('/:id', verifyAuthToken, orderController.deleteOrder);

// Update order status [token required]
orderRoutes.patch('/:id/status', verifyAuthToken, orderController.updateStatus);

// Get current order for user [token required]
orderRoutes.get(
  '/user/:userId/current',
  verifyAuthToken,
  orderController.getCurrentOrder
);

// Get completed orders for user [token required]
orderRoutes.get(
  '/user/:userId/completed',
  verifyAuthToken,
  orderController.getCompletedOrders
);

export default orderRoutes;
