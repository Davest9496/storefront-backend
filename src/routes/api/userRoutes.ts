import { Router, Request, Response } from 'express';
import { UserStore } from '../../models/user.model';
import {
  verifyAuthToken,
  verifyUserAuthorization,
  generateToken,
} from '../../middleware/auth.middleware';
import {
  validateUserCreate,
  validateUserUpdate,
} from '../../middleware/validation.middleware';
import {
  CreateUserDTO,
  UpdatePasswordDTO,
  UpdateUserDTO,
} from '../../types/shared.types';

const userRoute = Router();
const store = new UserStore();

// Get all users [token required]
userRoute.get(
  '/',
  verifyAuthToken,
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const users = await store.index();

      if (!users) {
        return res.status(404).json({ error: 'No users found' });
      }

      return res.json(users);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to fetch users',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// Get specific user [token required]
userRoute.get(
  '/:id',
  verifyAuthToken,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await store.show(userId);

      // Check existence first
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Then check authorization
      if (req.user?.id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to this resource',
        });
      }

      return res.json(user);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to fetch user',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// Create new user
userRoute.post(
  '/',
  validateUserCreate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const userData: CreateUserDTO = req.body;
      const newUser = await store.create(userData);

      // Generate token for new user
      const token = generateToken(newUser.id as number, newUser.email);

      return res.status(201).json({
        user: newUser,
        token,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes('Email already exists')
      ) {
        return res.status(400).json({ error: err.message });
      }

      return res.status(500).json({
        error: 'Failed to create user',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// Update user [token required]
userRoute.put(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  validateUserUpdate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const updates: UpdateUserDTO = req.body;

      const updatedUser = await store.update(userId, updates);
      return res.json(updatedUser);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('User not found')) {
          return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Email already exists')) {
          return res.status(400).json({ error: err.message });
        }
      }

      return res.status(500).json({
        error: 'Failed to update user',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// Update password [token required]
userRoute.put(
  '/:id/password',
  verifyAuthToken,
  verifyUserAuthorization,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const passwordData: UpdatePasswordDTO = req.body;

      await store.updatePassword(userId, passwordData);
      return res.json({ message: 'Password updated successfully' });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('User not found')) {
          return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Current password is incorrect')) {
          return res.status(400).json({ error: err.message });
        }
      }

      return res.status(500).json({
        error: 'Failed to update password',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// Delete user [token required]
userRoute.delete(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      await store.delete(userId);
      return res.json({ message: 'User deleted successfully' });
    } catch (err) {
      if (err instanceof Error && err.message.includes('User not found')) {
        return res.status(404).json({ error: err.message });
      }

      return res.status(500).json({
        error: 'Failed to delete user',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

// Get user's recent orders [token required]
userRoute.get(
  '/:id/orders/recent',
  verifyAuthToken,
  verifyUserAuthorization,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const recentOrders = await store.getRecentOrders(userId);
      return res.json(recentOrders);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to fetch recent orders',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }
);

export default userRoute;
