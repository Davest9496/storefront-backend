"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const order_controller_1 = require("../../../src/controllers/order.controller");
const orderRouter = (0, express_1.Router)();
// Create new order
orderRouter.post('/', auth_middleware_1.AuthMiddleware.verifyAuthToken, order_controller_1.OrderController.createOrder);
// Get current active order for a user
orderRouter.get('/current/:userId', auth_middleware_1.AuthMiddleware.verifyAuthToken, order_controller_1.OrderController.getCurrentOrder);
// Get completed orders for a user
orderRouter.get('/completed/:userId', auth_middleware_1.AuthMiddleware.verifyAuthToken, order_controller_1.OrderController.getCompletedOrders);
// Update order status
orderRouter.put('/:id/status', auth_middleware_1.AuthMiddleware.verifyAuthToken, order_controller_1.OrderController.updateOrderStatus);
exports.default = orderRouter;
//# sourceMappingURL=orderRoutes.js.map