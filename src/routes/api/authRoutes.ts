import { Router } from 'express';
import { login, signup } from '../../handlers/auth.handler';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/signup', signup);

export { authRouter };
