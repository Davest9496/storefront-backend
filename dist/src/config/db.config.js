"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.createPool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Ensure environment variables are loaded
dotenv_1.default.config();
// Validate required environment variables
const validateEnvVariables = () => {
    const required = ['DB_NAME', 'DB_USER'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
// Create and configure the database pool
const createPool = () => {
    // Validate environment variables before creating pool
    validateEnvVariables();
    // Log database connection details (excluding sensitive information)
    console.log('Initializing database connection with:', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
    });
    const pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    // Add error handler for the pool
    pool.on('error', (err) => {
        console.error('Unexpected error on idle database client:', err);
    });
    return pool;
};
exports.createPool = createPool;
// Test database connection
const testConnection = async (pool) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0].now);
        return true;
    }
    finally {
        client.release();
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=db.config.js.map