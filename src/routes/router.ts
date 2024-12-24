import { Router } from 'express';
import { userRoutes } from './api/userRoutes';
import { authRouter } from './api/authRoutes';
import { orderRouter } from './api/orderRoutes';

const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRouter);
router.use('/orders', orderRouter);

export { router };
