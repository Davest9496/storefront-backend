import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import router from './routes/router';

dotenv.config();

// Database configuration
export const dbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'storefront_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const client = await dbPool.connect();
    try {
      await client.query('SELECT NOW()');
      res.json({ status: 'healthy', database: 'connected' });
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API routes
app.use('/api', router);

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

export default app;
