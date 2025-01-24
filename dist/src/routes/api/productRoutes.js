"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const product_controller_1 = require("../../controllers/product.controller");
const productRouter = (0, express_1.Router)();
exports.productRouter = productRouter;
productRouter.get('/', product_controller_1.ProductController.getProducts);
productRouter.get('/:id', product_controller_1.ProductController.getProductById);
productRouter.get('/popular', product_controller_1.ProductController.getTopProducts);
productRouter.get('/category/:category', product_controller_1.ProductController.getProductsByCategory);
productRouter.post('/', auth_middleware_1.AuthMiddleware.verifyAuthToken, product_controller_1.ProductController.createProduct);
//# sourceMappingURL=productRoutes.js.map