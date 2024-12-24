import { Router } from 'express';
import { verifyAuthToken } from '../../middleware/auth.middleware';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../../handlers/user.handler';

const userRoutes = Router();

userRoutes.get('/', verifyAuthToken, getUsers);
userRoutes.get('/:id', verifyAuthToken, getUserById);
userRoutes.put('/:id', verifyAuthToken, updateUser);
userRoutes.delete('/:id', verifyAuthToken, deleteUser);

export { userRoutes };
