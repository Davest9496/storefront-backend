"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
// import { verifyAuthToken } from '../../middleware/auth.middleware';
const product_controller_1 = require("../../controllers/product.controller");
const productRouter = (0, express_1.Router)();
exports.productRouter = productRouter;
productRouter.get('/', product_controller_1.getProducts);
productRouter.get('/:id', product_controller_1.getProductById);
productRouter.get('/popular', product_controller_1.getTopProducts);
productRouter.get('/category/:category', product_controller_1.getProductsByCategory);
//# sourceMappingURL=productRoutes.js.map