const { exec } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting production database migration...');

// Create database.json configuration for production
const dbConfig = {
  dev: {
    driver: 'pg',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: true,
  },
  prod: {
    driver: 'pg',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: true,
  },
};

// Write temporary database.json file
const fs = require('fs');
fs.writeFileSync('./temp-database.json', JSON.stringify(dbConfig, null, 2));

// Run migration
exec(
  'db-migrate up --config ./temp-database.json -e prod',
  (error, stdout, stderr) => {
    // Delete temporary database.json file
    fs.unlinkSync('./temp-database.json');

    if (error) {
      console.error(`Migration error: ${error.message}`);
      console.error(stderr);
      process.exit(1);
    }

    console.log(`Migration completed successfully: ${stdout}`);
  }
);
