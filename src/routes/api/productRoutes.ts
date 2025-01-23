// // src/routes/productRoutes.ts
// import { Router } from 'express';
// import { verifyAuthToken } from '../../middleware/auth.middleware';
// import {
//   getProducts,
//   getProductById,
//   createProduct,
//   getTopProducts,
//   getProductsByCategory,
// } from '../../handlers/product.handler';

// const productRouter = Router();

// productRouter.get('/', getProducts);
// productRouter.get('/:id', getProductById);
// productRouter.get('/popular', getTopProducts);
// productRouter.get('/category/:category', getProductsByCategory);
// //-- Reserved for Admin, not implemented yet --//
// productRouter.post('/', verifyAuthToken, createProduct);

// export {productRouter};
