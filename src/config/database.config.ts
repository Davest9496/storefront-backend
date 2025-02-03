import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

interface DatabaseRow extends QueryResultRow {
  id?: number;
}

type QueryParams = string | number | boolean | null | undefined | Buffer | Date;

const getDbConfig = (): PoolConfig => {
  const isTest = process.env.NODE_ENV === 'test';

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
