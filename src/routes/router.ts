import { Router } from 'express';
import {userRoutes } from './api/userRoutes'
import { authRouter } from './api/authRoutes';

const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRouter)

export { router };
