import { Router } from 'express';
import userRoutes from './api/userRoutes';
import productRoutes from './api/product.route';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes)



export default router;
