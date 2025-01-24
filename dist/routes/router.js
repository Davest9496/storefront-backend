"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./api/userRoutes");
const authRoutes_1 = require("./api/authRoutes");
// import { orderRouter } from './api/orderRoutes';
// import { productRouter } from './api/productRoutes';
const router = (0, express_1.Router)();
exports.router = router;
router.use('/user', userRoutes_1.userRouter);
router.use('/auth', authRoutes_1.authRouter);
//# sourceMappingURL=router.js.map