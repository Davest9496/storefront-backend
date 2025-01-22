"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./api/userRoutes");
const authRoutes_1 = require("./api/authRoutes");
const orderRoutes_1 = require("./api/orderRoutes");
const productRoutes_1 = require("./api/productRoutes");
const router = (0, express_1.Router)();
exports.router = router;
router.use('/user', userRoutes_1.userRoutes);
router.use('/auth', authRoutes_1.authRouter);
router.use('/orders', orderRoutes_1.orderRouter);
router.use('/products', productRoutes_1.productRouter);
//# sourceMappingURL=router.js.map