import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import {
  verifyAuthToken,
  verifyUserAuthorization,
} from '../../middleware/auth.middleware';
import {
  validateUserCreate,
  validateUserUpdate,
} from '../../middleware/validation.middleware';

const userRoutes = Router();
const userController = new UserController();

// Get all users [token required]
userRoutes.get('/', verifyAuthToken, userController.index);

// Get specific user - login [token required]
userRoutes.get('/:id', verifyAuthToken, userController.show);

// Create new user
userRoutes.post('/', validateUserCreate, userController.create);

// Update user [token required]
userRoutes.put(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  validateUserUpdate,
  userController.update
);

// Update password [token required]
userRoutes.put(
  '/:id/password',
  verifyAuthToken,
  verifyUserAuthorization,
  userController.updatePassword
);

// Delete user [token required]
userRoutes.delete(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  userController.delete
);

// Get user's recent orders [token required]
userRoutes.get(
  '/:id/orders/recent',
  verifyAuthToken,
  verifyUserAuthorization,
  userController.getRecentOrders
);

export default userRoutes;
