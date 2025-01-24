import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { ProductController } from '../../controllers/product.controller';

const productRouter = Router();

productRouter.get('/', ProductController.getProducts);
productRouter.get('/:id', ProductController.getProductById);
productRouter.get('/popular', ProductController.getTopProducts);
productRouter.get('/category/:category', ProductController.getProductsByCategory);
productRouter.post(
  '/',
  AuthMiddleware.verifyAuthToken,
  ProductController.createProduct
);

export {productRouter};
