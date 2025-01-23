import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SecurityConfig } from '../config/security.config';
import { AuthenticatedUser } from '../types/auth.types';

export class AuthMiddleware {
  static verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
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

      const user = AuthService.validateToken(token);
      if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      // Add validated user to request object
      req.user = user as AuthenticatedUser;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}
