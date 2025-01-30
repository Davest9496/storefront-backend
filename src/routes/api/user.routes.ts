import express from 'express';
import { UserController } from '../../controllers/user.controller';
import {
  verifyAuthToken,
  verifyUserAuthorization,
} from '../../middleware/auth.middleware';
import {
  validateUserCreate,
  validateUserUpdate,
} from '../../middleware/validation.middleware';

const userRoutes = express.Router();
const userController = new UserController();

// Create a new user (signup)
userRoutes.post('/', validateUserCreate, async (req, res) => {
  try {
    const result = await userController.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Email already exists')
    ) {
      res.status(409).json({
        error: 'Email already exists',
        details: 'This email address is already registered',
      });
    } else {
      console.error('User creation error:', error);
      res.status(400).json({
        error: 'Could not create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

// Get all users [token required]
userRoutes.get('/', verifyAuthToken, async (_req, res) => {
  try {
    const users = await userController.index();
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Could not retrieve users' });
  }
});

// Get specific user [token required]
userRoutes.get(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  async (req, res) => {
    try {
      const user = await userController.show(parseInt(req.params.id));
      res.json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        console.error('Error retrieving user:', error);
        res.status(400).json({ error: 'Could not retrieve user' });
      }
    }
  }
);

// Update user [token required]
userRoutes.put(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  validateUserUpdate,
  async (req, res) => {
    try {
      const user = await userController.update(
        parseInt(req.params.id),
        req.body
      );
      res.json(user);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Email already exists')
      ) {
        // Send appropriate status code and error message for email conflicts
        res.status(409).json({
          error: 'Email already exists',
          details: 'This email address is already registered to another user',
        });
      } else {
        console.error('Error updating user:', error);
        res.status(400).json({
          error: 'Could not update user',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
);

// Delete user [token required]
userRoutes.delete(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  async (req, res) => {
    try {
      await userController.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(400).json({ error: 'Could not delete user' });
    }
  }
);

// Get user's recent orders [token required]
userRoutes.get(
  '/:id/orders',
  verifyAuthToken,
  verifyUserAuthorization,
  async (req, res) => {
    try {
      const orders = await userController.getRecentOrders(
        parseInt(req.params.id)
      );
      res.json(orders);
    } catch (error) {
      console.error('Error retrieving orders:', error);
      res.status(400).json({ error: 'Could not retrieve orders' });
    }
  }
);

export default userRoutes;
