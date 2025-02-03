import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

// Define the structure of our environment variables
interface DatabaseEnv {
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  ENV: string;
  PORT: string;
}

// Define a type for query parameters
type QueryParams = string | number | boolean | null | undefined | Buffer | Date;

// Define a base interface for database rows
interface DatabaseRow extends QueryResultRow {
  id?: number;
}

// Load and validate environment variables
const getEnvVars = (): DatabaseEnv => {
  const vars = process.env as unknown as Partial<DatabaseEnv>;

  const required = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'ENV',
    'PORT',
  ] as const;

  const missing = required.filter((key) => !vars[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return vars as DatabaseEnv;
};

// Get environment variables
const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ENV,
} = getEnvVars();

// Configure database connection
const getDbConfig = (): PoolConfig => {
  const baseConfig: PoolConfig = {
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    // Add SSL configuration for production environments if needed
    ...(ENV === 'production' && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  };

  return baseConfig;
};

// Create and export the database pool
const pool = new Pool(getDbConfig());

// Add error handling for the pool
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Interface for query logging
interface QueryLog {
  text: string;
  duration: number;
  rows: number;
}

// Interface for query error logging
interface QueryErrorLog {
  text: string;
  error: Error;
}

/**
 * Execute a database query with proper typing and logging
 * @param text The SQL query text
 * @param params Optional array of parameter values
 * @returns Promise resolving to a typed query result
 */
export async function query<T extends DatabaseRow>(
  text: string,
  params?: QueryParams[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    const logData: QueryLog = {
      text,
      duration,
      rows: res.rowCount ?? 0,
    };
    console.log('Executed query', logData);

    return res;
  } catch (error) {
    const errorData: QueryErrorLog = {
      text,
      error: error as Error,
    };
    console.error('Error executing query', errorData);
    throw error;
  }
}

export default pool;
