import express from 'express';
import { OrderController } from '../../controllers/order.controller';
import { verifyAuthToken } from '../../middleware/auth.middleware';

const orderRoutes = express.Router();
const orderController = new OrderController();

// Get current order for user
orderRoutes.get(
  '/current/:userId',
  verifyAuthToken,
  async (req, res, next) => {
    // Custom authorization check for orders
    if (req.user?.id !== parseInt(req.params.userId)) {
      res.status(403).json({ error: 'Unauthorized access to order' });
      return;
    }
    next();
  },
  async (req, res) => {
    await orderController.getCurrentOrder(req, res);
  }
);

// Get completed orders for user
orderRoutes.get(
  '/completed/:userId',
  verifyAuthToken,
  async (req, res, next) => {
    // Custom authorization check for orders
    if (req.user?.id !== parseInt(req.params.userId)) {
      res.status(403).json({ error: 'Unauthorized access to orders' });
      return;
    }
    next();
  },
  async (req, res) => {
    await orderController.getCompletedOrders(req, res);
  }
);

// Create new order
orderRoutes.post('/', verifyAuthToken, async (req, res) => {
  await orderController.create(req, res);
});

// Add product to order
orderRoutes.post('/:id/products', verifyAuthToken, async (req, res) => {
  await orderController.addProduct(req, res);
});

// Complete an order
orderRoutes.put('/:id/complete', verifyAuthToken, async (req, res) => {
  await orderController.completeOrder(req, res);
});

export default orderRoutes;
