// src/routes/userRoutes.ts
import { Router } from 'express';
import { verifyAuthToken } from '../../middleware/auth.middleware';
import { getUsers, getUserById, signup } from '../../handlers/user.handler';

const router = Router();

// GET /api/users - Index [token required]
router.get('/', verifyAuthToken, getUsers);

// GET /api/users/:id - Show [token required]
router.get('/:id', verifyAuthToken, getUserById);

// POST /api/users - Create
router.post('/', signup);

export default router;
