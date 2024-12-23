import {Router, Request, Response} from 'express';

const routes = Router();

// Health check endpoint
routes.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

export {routes}