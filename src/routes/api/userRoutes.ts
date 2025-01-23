import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { UserController } from '../../handlers/user.handler';

const userRouter = Router();

userRouter.get('/', AuthMiddleware.verifyAuthToken, UserController.getUsers);
userRouter.get(
  '/:id',
  AuthMiddleware.verifyAuthToken,
  UserController.getUserById
);
userRouter.put(
  '/:id',
  AuthMiddleware.verifyAuthToken,
  UserController.updateUser
);
userRouter.delete(
  '/:id',
  AuthMiddleware.verifyAuthToken,
  UserController.deleteUser
);

export { userRouter };
