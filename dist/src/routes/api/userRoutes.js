"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_handler_1 = require("../../handlers/user.handler");
const userRoutes = (0, express_1.Router)();
exports.userRoutes = userRoutes;
userRoutes.get('/', auth_middleware_1.verifyAuthToken, user_handler_1.getUsers);
userRoutes.get('/:id', auth_middleware_1.verifyAuthToken, user_handler_1.getUserById);
userRoutes.put('/:id', auth_middleware_1.verifyAuthToken, user_handler_1.updateUser);
userRoutes.delete('/:id', auth_middleware_1.verifyAuthToken, user_handler_1.deleteUser);
//# sourceMappingURL=userRoutes.js.map