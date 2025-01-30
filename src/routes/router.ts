import { Router } from 'express';
import userRoutes from './api/user.routes';
import productRoutes from './api/product.route';
import orderRoutes from './api/order.route';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes)


export default router;
