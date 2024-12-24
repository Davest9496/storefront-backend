// src/routes/orderRoutes.ts
import { Router } from 'express';
import { verifyAuthToken } from '../middleware/auth';
import {
  getCurrentOrder,
  getCompletedOrders,
  createOrder,
  addProduct,
  updateOrderStatus,
} from '../controllers/orderController';

const router = Router();

// GET /api/orders/current/:userId - Get current order by user [token required]
router.get('/current/:userId', verifyAuthToken, getCurrentOrder);

// GET /api/orders/completed/:userId - Get completed orders by user [token required]
router.get('/completed/:userId', verifyAuthToken, getCompletedOrders);

// POST /api/orders - Create new order [token required]
router.post('/', verifyAuthToken, createOrder);

// POST /api/orders/:id/products - Add product to order [token required]
router.post('/:id/products', verifyAuthToken, addProduct);

// PUT /api/orders/:id/status - Update order status [token required]
router.put('/:id/status', verifyAuthToken, updateOrderStatus);

export default router;
