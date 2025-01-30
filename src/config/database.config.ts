import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_TEST,
  ENV,
} = process.env;

let client: Pool;

if (ENV === 'test') {
  client = new Pool({
    host: DB_HOST,
    database: DB_TEST,
    user: DB_USER,
    password: DB_PASSWORD,
  });
} else {
  client = new Pool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });
}

export default client;
