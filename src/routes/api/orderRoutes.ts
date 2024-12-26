// src/routes/orderRoutes.ts
import { Router } from 'express';
import { verifyAuthToken } from '../../middleware/auth.middleware';
import {
  getCurrentOrder,
  getCompletedOrders,
  createOrder,
  addProduct,
  updateOrderStatus,
} from '../../handlers/order.handler';

const orderRouter = Router();

orderRouter.post('/', verifyAuthToken, createOrder);
orderRouter.get('/current/:userId', verifyAuthToken, getCurrentOrder);
orderRouter.get('/completed/:userId', verifyAuthToken, getCompletedOrders);
orderRouter.post('/:id/products', verifyAuthToken, addProduct);
orderRouter.put('/:id/status', verifyAuthToken, updateOrderStatus);

export { orderRouter };