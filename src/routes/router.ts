import { Router } from 'express';
import { userRouter } from './api/userRoutes';
import { authRouter } from './api/authRoutes';
// import { orderRouter } from './api/orderRoutes';
import productRoutes from './api/productRoutes';

const router = Router();

router.use('/user', userRouter);
router.use('/auth', authRouter);
// router.use('/orders', orderRouter);
router.use('/products', productRoutes)

export { router };
