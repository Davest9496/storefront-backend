"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes_1 = require("./api/userRoutes");
const authRoutes_1 = require("./api/authRoutes");
const productRoutes_1 = __importDefault(require("./api/productRoutes"));
const router = (0, express_1.Router)();
router.use('/users', userRoutes_1.userRouter);
router.use('/auth', authRoutes_1.authRouter);
router.use('/products', productRoutes_1.default);
exports.default = router;
//# sourceMappingURL=router.js.map