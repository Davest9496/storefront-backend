import { Pool } from 'pg';
import getDBConfig from './config/db.config';

const pool = new Pool(getDBConfig());

export default pool;
