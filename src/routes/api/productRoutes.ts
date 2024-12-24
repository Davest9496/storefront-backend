// src/routes/productRoutes.ts
import { Router } from 'express';
import { verifyAuthToken } from '../middleware/auth';
import {
  getAllProducts,
  getProductById,
  createProduct,
  getTopProducts,
  getProductsByCategory,
} from '../controllers/productController';

const router = Router();

// GET /api/products
router.get('/', getAllProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// POST /api/products (protected)
router.post('/', verifyAuthToken, createProduct);

// GET /api/products/popular
router.get('/popular', getTopProducts);

// GET /api/products/category/:category
router.get('/category/:category', getProductsByCategory);

export default router;
