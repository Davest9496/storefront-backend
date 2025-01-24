"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const product_controller_1 = require("../../controllers/product.controller");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.ProductController.getProducts);
router.get('/:id', product_controller_1.ProductController.getProductById);
router.get('/popular', product_controller_1.ProductController.getTopProducts);
router.get('/category/:category', product_controller_1.ProductController.getProductsByCategory);
router.post('/', auth_middleware_1.AuthMiddleware.verifyAuthToken, product_controller_1.ProductController.createProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map