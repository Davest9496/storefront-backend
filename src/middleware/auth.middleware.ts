import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SecurityConfig } from '../config/security.config';
import { AuthenticatedUser } from '../types/authenticatedUser.types';

export const verifyAuthToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!SecurityConfig.jwt.secret) {
      throw new Error('JWT secret is not defined');
    }
    const decoded = jwt.verify(token, SecurityConfig.jwt.secret);

    // Add decoded user to request object
    req.user = decoded as AuthenticatedUser;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
