import { Request, Response } from 'express';
import { dbPool } from '../server';
import { UserService } from '../services/user.service';

export class UserController {
  static async getUsers(req: Request, res: Response): Promise<void> {
    const client = await dbPool.connect();
    try {
      const userService = new UserService(client);
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    const client = await dbPool.connect();

    try {
      const userService = new UserService(client);
      const user = await userService.getProfile(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);

    if (req.user?.id !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this user' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const userService = new UserService(client);
      const updatedUser = await userService.updateProfile(userId, req.body);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } finally {
      client.release();
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);

    if (req.user?.id !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this user' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const userService = new UserService(client);
      await userService.deleteAccount(userId);
      res.json({ message: 'User successfully deleted' });
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } finally {
      client.release();
    }
  }
}
