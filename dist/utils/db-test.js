"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Function to check if .env file exists and log its location
function checkEnvFile() {
    const envPath = path_1.default.join(process.cwd(), '.env');
    console.log('Looking for .env file at:', envPath);
    if (fs_1.default.existsSync(envPath)) {
        console.log('.env file found');
        // Log first line of .env file to verify it's the right file
        const firstLine = fs_1.default.readFileSync(envPath, 'utf8').split('\n')[0];
        console.log('First line of .env:', firstLine);
    }
    else {
        console.log('.env file not found');
    }
}
async function testDatabase() {
    console.log('Current working directory:', process.cwd());
    // Check .env file before loading
    checkEnvFile();
    // Load environment variables and log the result
    const envResult = dotenv_1.default.config();
    if (envResult.error) {
        console.error('Error loading .env file:', envResult.error);
    }
    else {
        console.log('.env file loaded successfully');
    }
    // Log all relevant environment variables
    console.log('\nEnvironment Variables:');
    const relevantVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];
    relevantVars.forEach((varName) => {
        console.log(`${varName}:`, process.env[varName] || 'not set');
    });
    // Create database connection configuration
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };
    console.log('\nAttempting database connection with config:', {
        ...dbConfig,
        password: '[REDACTED]',
    });
    const pool = new pg_1.Pool(dbConfig);
    try {
        console.log('\nTesting database connection...');
        const client = await pool.connect();
        console.log('Successfully connected to database');
        // Test basic query
        const result1 = await client.query('SELECT NOW()');
        console.log('Basic query successful:', result1.rows[0].now);
        // Check available tables
        console.log('\nChecking database tables...');
        const result2 = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        `);
        console.log('Available tables:', result2.rows.map((row) => row.table_name));
        // If products table exists, check its contents
        if (result2.rows.some((row) => row.table_name === 'products')) {
            console.log('\nChecking products table...');
            const result3 = await client.query('SELECT COUNT(*) FROM products');
            console.log('Number of products:', result3.rows[0].count);
            // Show sample product
            const sampleProduct = await client.query('SELECT * FROM products LIMIT 1');
            if (sampleProduct.rows.length > 0) {
                console.log('Sample product:', sampleProduct.rows[0]);
            }
        }
        client.release();
    }
    catch (err) {
        console.error('\nDatabase test failed:', err);
    }
    finally {
        await pool.end();
    }
}
// Run the test
console.log('Starting database test...');
testDatabase()
    .then(() => console.log('Database test completed'))
    .catch((error) => console.error('Test failed:', error));
//# sourceMappingURL=db-test.js.map