'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createPool = void 0;
const pg_1 = require('pg');
const dbConfig = {
  user: process.env.POSTGRES_UESR,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
};
const createPool = () => new pg_1.Pool(dbConfig);
exports.createPool = createPool;
//# sourceMappingURL=db.config.js.map
