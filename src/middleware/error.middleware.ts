
import { Request, Response, NextFunction } from 'express';
import {
  AppError,
  NotFoundError,
  isAppError,
} from '../utils/error.utils';

// Handle 404 errors for routes that don't exist
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Special handling for favicon.ico requests
  if (req.originalUrl.includes('favicon.ico')) {
    return res.status(204).end(); // No content - browser will cache this response
  }

  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  return; // Explicitly return to ensure all code paths return a value
};

// Handle all other errors
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let status = 'error';
  let message = 'Internal Server Error';

  // Use our AppError properties if it's an AppError
  if (isAppError(err)) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  } else {
    // For standard errors, just use the message
    message = err.message;
  }

  // Return error response
  return res.status(statusCode).json({
    status: status,
    message: message,
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
