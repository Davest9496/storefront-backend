import express from 'express';
import { UserController } from '../../controllers/user.controller';
import {
  verifyAuthToken,
  verifyUserAuthorization,
} from '../../middleware/auth.middleware';
import {
  validateUserCreate,
} from '../../middleware/validation.middleware';

const userRoutes = express.Router();
const userController = new UserController();

// Debug middleware to log request body
const debugMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.log('Request Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  next();
};

// Create a new user (signup)
userRoutes.post('/', debugMiddleware, validateUserCreate, async (req, res) => {
  try {
    console.log('Attempting to create user with data:', req.body);
    const result = await userController.create(req.body);
    console.log('User creation result:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('User creation error:', error);
    if (
      error instanceof Error &&
      error.message.includes('Email already exists')
    ) {
      res.status(409).json({
        error: 'Email already exists',
        details: 'This email address is already registered',
      });
    } else {
      res.status(400).json({
        error: 'Could not create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

// Get all users [token required]
userRoutes.get('/', debugMiddleware, verifyAuthToken, async (_req, res) => {
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
  debugMiddleware,
  verifyAuthToken,
  verifyUserAuthorization,
  async (req, res) => {
    try {
      const user = await userController.show(parseInt(req.params.id));
      res.json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(400).json({ error: 'Could not retrieve user' });
      }
    }
  }
);

export default userRoutes;
