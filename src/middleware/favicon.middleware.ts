// src/middleware/favicon.middleware.ts

import { Request, Response, NextFunction } from 'express';

// Simple middleware to handle favicon.ico requests
export const faviconHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.originalUrl === '/favicon.ico') {
    // Return 204 No Content to browser (will stop browser from requesting it again)
    res.status(204).end();
  } else {
    next();
  }
};
