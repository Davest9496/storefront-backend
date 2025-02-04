import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

// Interface for JWT payload
interface JWTPayload {
  user: {
    id: number;
    email: string;
  };
}

// Utility function to generate JWT token
export const generateToken = (userId: number, email: string): string => {
  try {
    return jwt.sign(
      {
        user: { id: userId, email },
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
  } catch (error) {
    throw new Error(`Error generating token: ${error}`);
  }
};

// Middleware to verify JWT token
export const verifyAuthToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JWTPayload;

      // Add user info to request object
      req.user = decoded.user;
      next();
    } catch (jwtError) {
      console.log(jwtError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Middleware to verify user authorization (user can only access their own resources)
export const verifyUserAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.user) {
      throw new Error('User not authenticated');
    }

    if (req.user.id !== userId) {
      throw new Error('Unauthorized access to this resource');
    }

    next();
  } catch (error) {
    res.status(403).json({
      error: 'Unauthorized',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


// Password utilities
export const passwordUtils = {
  // Get pepper value from environment variables
  getPepper: (): string => {
    const pepper = process.env.BCRYPT_PASSWORD;
    if (!pepper) {
      throw new Error('BCRYPT_PASSWORD (pepper) not set in environment');
    }
    return pepper;
  },

  // Get salt rounds from environment variables
  getSaltRounds: (): number => {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    if (isNaN(saltRounds)) {
      throw new Error('SALT_ROUNDS must be a valid number');
    }
    return saltRounds;
  },
};
