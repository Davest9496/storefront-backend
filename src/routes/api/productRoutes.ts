import { Router } from 'express';
import { ProductController } from '../../controllers/product.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/popular', ProductController.getTopProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Protected route
router.post('/', AuthMiddleware.verifyAuthToken, ProductController.createProduct);

export default router;
