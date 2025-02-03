import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './routes/router';
import { dbPool } from './config/database.config';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

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
    console.error('Health check failed:', error);
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
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
