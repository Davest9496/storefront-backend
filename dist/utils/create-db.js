'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const dotenv_1 = __importDefault(require('dotenv'));
const pg_1 = require('pg');
dotenv_1.default.config();
const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_TEST_DB,
} = process.env;
const pool = new pg_1.Pool({
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
//# sourceMappingURL=create-db.js.map
