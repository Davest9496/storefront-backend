import { Router } from 'express';
import { userRoutes } from './api/userRoutes';
import { authRouter } from './api/authRoutes';
import { orderRouter } from './api/orderRoutes';
import { productRouter } from './api/productRoutes';

const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRouter);
router.use('/orders', orderRouter);
router.use('/products', productRouter)

export { router };
