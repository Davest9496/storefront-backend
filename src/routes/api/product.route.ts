import { Router } from 'express';
import { ProductController } from '../../controllers/product.controller';
import { verifyAuthToken } from '../../middleware/auth.middleware';

const productRoutes = Router();
const controller = new ProductController();

// Public routes
productRoutes.get('/', controller.index);
productRoutes.get('/search', controller.searchProducts);
productRoutes.get('/popular', controller.getPopular);
productRoutes.get('/category/:category', controller.getByCategory);
productRoutes.get('/:id', controller.show);

// Protected routes (require authentication)
productRoutes.post('/', verifyAuthToken, controller.create);
productRoutes.put('/:id', verifyAuthToken, controller.update);
productRoutes.delete('/:id', verifyAuthToken, controller.delete);

export default productRoutes;
