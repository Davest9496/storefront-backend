import { Request, Response } from 'express';
import { UserStore } from '../models/user.model';
import { generateToken } from '../middleware/auth.middleware';
import {
  CreateUserDTO,
  UpdatePasswordDTO,
  UpdateUserDTO,
} from '../types/shared.types';

export class UserController {
  private store: UserStore;

  constructor() {
    this.store = new UserStore();
  }

  index = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.store.index();

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
  };

  show = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.store.show(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

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
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userData: CreateUserDTO = req.body;
      const newUser = await this.store.create(userData);
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
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const updates: UpdateUserDTO = req.body;
      const updatedUser = await this.store.update(userId, updates);
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
  };

  updatePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const passwordData: UpdatePasswordDTO = req.body;

      await this.store.updatePassword(userId, passwordData);
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
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      await this.store.delete(userId);
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
  };

  getRecentOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      const recentOrders = await this.store.getRecentOrders(userId);
      return res.json(recentOrders);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to fetch recent orders',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  };
}
