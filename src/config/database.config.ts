import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Determine which environment file to use based on NODE_ENV
let envFile = '.env';
if (process.env.NODE_ENV === 'test') {
  envFile = '.env.test';
} else if (process.env.NODE_ENV === 'production') {
  envFile = '.env.production';
}

const envPath = path.resolve(process.cwd(), envFile);
dotenv.config({ path: envPath });

interface DatabaseRow extends QueryResultRow {
  id?: number | string;
}

// Expand QueryParams to include arrays for PostgreSQL compatibility
type QueryParams =
  | string
  | number
  | boolean
  | null
  | undefined
  | Buffer
  | Date
  | string[]
  | unknown[];
const getDbConfig = (): PoolConfig => {
  const isTest = process.env.NODE_ENV === 'test';
  const isProd = process.env.NODE_ENV === 'production';

  // Production environment might use connection string instead of individual params
  if (isProd && process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for some cloud providers
    };
  }

  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    database: isTest
      ? process.env.POSTGRES_TEST_DB || 'storefront_test'
      : process.env.POSTGRES_DB || 'storefront_dev',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  };
};

const pool = new Pool(getDbConfig());

// Add error handling for the pool
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query<T extends DatabaseRow>(
  text: string,
  params?: QueryParams[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== 'test') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

export const dbPool = pool;
export default { query, dbPool };
