"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_handler_1 = require("../../handlers/auth.handler");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
authRouter.post('/login', auth_handler_1.login);
authRouter.post('/signup', auth_handler_1.signup);
//# sourceMappingURL=authRoutes.js.map