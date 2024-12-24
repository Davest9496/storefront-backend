import { Router } from 'express';
import { login, signup } from '../handlers/';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/signup
router.post('/signup', signup);

export default router;
