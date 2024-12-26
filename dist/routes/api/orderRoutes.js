"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
// src/routes/orderRoutes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const order_handler_1 = require("../../handlers/order.handler");
const orderRouter = (0, express_1.Router)();
exports.orderRouter = orderRouter;
orderRouter.get('/current/:userId', auth_middleware_1.verifyAuthToken, order_handler_1.getCurrentOrder);
orderRouter.get('/completed/:userId', auth_middleware_1.verifyAuthToken, order_handler_1.getCompletedOrders);
orderRouter.post('/', auth_middleware_1.verifyAuthToken, order_handler_1.createOrder);
orderRouter.post('/:id/products', auth_middleware_1.verifyAuthToken, order_handler_1.addProduct);
orderRouter.put('/:id/status', auth_middleware_1.verifyAuthToken, order_handler_1.updateOrderStatus);
//# sourceMappingURL=orderRoutes.js.map