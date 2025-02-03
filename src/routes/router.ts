import { Router } from 'express';
import userRoute from './api/userRoutes';

const router = Router();

router.use('/users', userRoute);



export default router;
