import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  user: process.env.POSTGRES_UESR,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
};

export const createPool = (): Pool => new Pool(dbConfig);
