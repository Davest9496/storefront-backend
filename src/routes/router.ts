import { Router } from 'express';
import { userRouter } from './api/userRoutes';
import { authRouter } from './api/authRoutes';
import { productRouter } from './api/productRoutes';

const router = Router();

router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/products', productRouter);

export default router;
