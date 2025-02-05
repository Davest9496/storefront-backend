import { Router } from 'express';
import userRoutes from './api/user.routes';
import productRoutes from './api/product.routes';
import orderRoutes from './api/order.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes)
router.use('/orders', orderRoutes)



export default router;
