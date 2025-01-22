"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
// src/routes/productRoutes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const product_handler_1 = require("../../handlers/product.handler");
const productRouter = (0, express_1.Router)();
exports.productRouter = productRouter;
productRouter.get('/', product_handler_1.getProducts);
productRouter.get('/:id', product_handler_1.getProductById);
productRouter.get('/popular', product_handler_1.getTopProducts);
productRouter.get('/category/:category', product_handler_1.getProductsByCategory);
//-- Reserved for Admin, not implemented yet --//
productRouter.post('/', auth_middleware_1.verifyAuthToken, product_handler_1.createProduct);
//# sourceMappingURL=productRoutes.js.map