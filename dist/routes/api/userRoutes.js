"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_controller_1 = require("../../controllers/user.controller");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
userRouter.get('/', auth_middleware_1.AuthMiddleware.verifyAuthToken, user_controller_1.UserController.getUsers);
userRouter.get('/:id', auth_middleware_1.AuthMiddleware.verifyAuthToken, user_controller_1.UserController.getUserById);
userRouter.put('/:id', auth_middleware_1.AuthMiddleware.verifyAuthToken, user_controller_1.UserController.updateUser);
userRouter.delete('/:id', auth_middleware_1.AuthMiddleware.verifyAuthToken, user_controller_1.UserController.deleteUser);
//# sourceMappingURL=userRoutes.js.map