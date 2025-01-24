import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { ProductController } from '../../controllers/product.controller';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.get('/popular', ProductController.getTopProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.post(
  '/',
  AuthMiddleware.verifyAuthToken,
  ProductController.createProduct
);

export default router;
