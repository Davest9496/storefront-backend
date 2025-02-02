import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import router from './routes/router';

// Load environment variables before anything else
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

// Database configuration
const getDbConfig = (): {
  host: string;
  database: string;
  user: string;
  password?: string;
  port: number;
} => {
  const isTest = process.env.NODE_ENV === 'test';
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    database: isTest ? 'storefront_test' : 'storefront_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  };

  // Log database information in test environment
  if (isTest) {
    console.log('Test Database Configuration:');
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}`);
  }

  return dbConfig;
};

export const dbPool = new Pool(getDbConfig());

const app: Application = express();

// Configure CORS based on environment
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5173'];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });
}

// Body parsing middleware - needed for all environments including testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    console.error('Database health check failed:', error);
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API routes
app.use('/api', router);

// Error handling middleware
// Using underscore prefix for unused parameters to satisfy ESLint
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response
    // Removing the _next parameter since it's not used
  ) => {
    console.error('Error:', err);

    const errorResponse =
      process.env.NODE_ENV === 'test'
        ? { error: 'Internal Server Error', details: err.message }
        : { error: 'Internal Server Error' };

    res.status(500).json(errorResponse);
  }
);

// Separate server startup into its own function
import { Server } from 'http';

const startServer = (): Server => {
  const port = process.env.PORT || 3000;
  return app.listen(port, () => {
    console.log(
      `Server started on port ${port} in ${process.env.NODE_ENV || 'development'} mode`
    );
    if (process.env.NODE_ENV !== 'test') {
      console.log('CORS enabled for development origins');
    }
  });
};

// Only start the server if we're not in a test environment AND this file is being run directly
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  startServer();
}

export { startServer };
export default app;
