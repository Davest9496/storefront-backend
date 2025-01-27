import dotenv from 'dotenv';
import path from 'path';

// Load environment specific configuration
const envPath =
  process.env.NODE_ENV === 'test'
    ? path.join(__dirname, '../../.env.test')
    : path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

const getDBConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
  };

  // Validate required fields
  const requiredFields: (keyof DatabaseConfig)[] = ['host', 'database', 'user'];
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required database configuration: ${field}`);
    }
  }

  return config;
};

export default getDBConfig;
