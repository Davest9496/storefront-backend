import { Router } from 'express';
import { AuthController } from '../../handlers/auth.handler';

const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/signup', AuthController.signup);

export { authRouter };
