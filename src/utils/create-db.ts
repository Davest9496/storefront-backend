import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_TEST_DB,
} = process.env;

const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: 'postgres',
});

async function createDb() {
  try {
    // Drop dev database if it exists
    await pool.query(`DROP DATABASE IF EXISTS ${POSTGRES_DB}`);
    console.log(`Database ${POSTGRES_DB} dropped`);

    // Drop test database if it exists
    await pool.query(`DROP DATABASE IF EXISTS ${POSTGRES_TEST_DB}`);
    console.log(`Database ${POSTGRES_TEST_DB} dropped`);

    // Create dev database
    await pool.query(`CREATE DATABASE ${POSTGRES_DB}`);
    console.log(`Database ${POSTGRES_DB} created`);

    // Create test database
    await pool.query(`CREATE DATABASE ${POSTGRES_TEST_DB}`);
    console.log(`Database ${POSTGRES_TEST_DB} created`);
    
  } catch (err) {
    console.error('Error creating databases', err);
  } finally {
    await pool.end();
  }
}

createDb();
