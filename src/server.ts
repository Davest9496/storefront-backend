import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes/router';
import { dbPool } from './config/database.config';
import { faviconHandler } from './middleware/favicon.middleware';
import { AppError } from './utils/error.utils';
import cors from 'cors';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true, // Include credentials if needed
  })
);

// Add favicon handler first to intercept favicon requests
app.use(faviconHandler);
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await dbPool.connect();
    try {
      await client.query('SELECT NOW()');
      res.json({ status: 'healthy', database: 'connected' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API routes
app.use('/api', router);

// 404 handler for undefined routes
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    status: 'not_found',
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(
  (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    console.error('Error:', err);

    // Default error values
    let statusCode = 500;
    let status = 'error';
    let message = 'Internal Server Error';

    // If it's our AppError type, use its values
    if (err instanceof AppError) {
      statusCode = err.statusCode;
      status = err.status;
      message = err.message;
    } else if (err instanceof Error) {
      // For standard JavaScript errors, use the message
      message = err.message;
    }

    res.status(statusCode).json({
      status: status,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

export default app;
