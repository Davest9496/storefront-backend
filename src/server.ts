import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createPool, testConnection } from './config/db.config';
import { router } from './routes/router';
import { verifySecurityConfig } from './config/security.config';

// Load environment variables
dotenv.config();

// Verify security configuration before starting the server
if (!verifySecurityConfig()) {
    console.error('Failed to verify security configuration. Please check your environment variables.');
    process.exit(1);
}

// Create and export the database pool
export const dbPool = createPool();

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(express.json());

// Health check endpoint to verify database connectivity
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await testConnection(dbPool);
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api', router);

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error('Error:', err);

  // Provide detailed errors in development, simplified in production
  const errorResponse = {
    error: 'Internal Server Error',
    status: 500,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(errorResponse);
});

// Start server function with database connection check
const startServer = async () => {
  try {
    // Verify database connection before starting server
    await testConnection(dbPool);
    console.log('Database connection verified');

    app.listen(port, () => {
      console.log(`Server started successfully on port: ${port}`);
      console.log(`Health check available at: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit if we can't connect to the database
  }
};

// Start the server
startServer();

export default app;
