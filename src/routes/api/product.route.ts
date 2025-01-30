import express from 'express';
import { ProductController } from '../../controllers/product.controller';
import { verifyAuthToken } from '../../middleware/auth.middleware';

const productRoutes = express.Router();
const productController = new ProductController();

// GET /api/products/popular - Get top 5 most popular products
// Note: Specific routes must come before parameterized routes
productRoutes.get('/popular', async (req, res) => {
  await productController.getPopularProducts(req, res);
});

// GET /api/products/category/:category - Get products by category
productRoutes.get('/category/:category', async (req, res) => {
  await productController.getByCategory(req, res);
});

// GET /api/products - Get all products
productRoutes.get('/', async (req, res) => {
  await productController.index(req, res);
});

// GET /api/products/:id - Get specific product
productRoutes.get('/:id', async (req, res) => {
  await productController.show(req, res);
});

// POST /api/products - Create new product [token required]
productRoutes.post('/', verifyAuthToken, async (req, res) => {
  await productController.create(req, res);
});

export default productRoutes;
