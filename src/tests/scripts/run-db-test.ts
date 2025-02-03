import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load our environment variables
dotenv.config();

interface DatabaseConfig {
    host: string;
    database: string;
    user: string;
    password: string | undefined;
    port: number;
}

interface DatabaseCheckResult {
    datname: string;
}

function createDatabaseConfig(database: string): DatabaseConfig {
    return {
        host: process.env.POSTGRES_HOST || 'localhost',
        database,
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        port: 5432
    };
}

async function verifyDatabaseSetup(): Promise<void> {
    const initialPool: Pool = new Pool(createDatabaseConfig('postgres'));
    let client: PoolClient | null = null;

    try {
        console.log('Attempting to connect to PostgreSQL...');
        client = await initialPool.connect();
        console.log('Successfully connected to PostgreSQL');

        const dbCheckResult = await client.query<DatabaseCheckResult>(`
            SELECT datname 
            FROM pg_database 
            WHERE datname IN ('storefront_dev', 'storefront_test')
        `);

        console.log('\nExisting databases:', dbCheckResult.rows.map(row => row.datname));

        const requiredDatabases: string[] = ['storefront_dev', 'storefront_test'];
        const existingDatabases: Set<string> = new Set(dbCheckResult.rows.map(row => row.datname));

        for (const dbName of requiredDatabases) {
            if (!existingDatabases.has(dbName)) {
                console.log(`\nCreating ${dbName} database...`);
                await client.query(`CREATE DATABASE ${dbName}`);
                console.log(`Successfully created ${dbName} database`);
            }
        }

        const currentUser: string = process.env.POSTGRES_USER || 'postgres';
        for (const dbName of requiredDatabases) {
            await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${currentUser}`);
        }
        
        console.log('\nDatabase privileges granted successfully');

        const devPool: Pool = new Pool(createDatabaseConfig('storefront_dev'));
        const devClient: PoolClient = await devPool.connect();
        console.log('\nSuccessfully connected to storefront_dev database');
        await devClient.release();
        await devPool.end();

    } catch (error) {
        console.error('\n❌ Error during database verification:', error);
        throw error;
    } finally {
        if (client) {
            await client.release();
        }
        await initialPool.end();
    }
}

verifyDatabaseSetup()
    .then((): void => {
        console.log('\n✅ Database setup verification completed successfully!');
        process.exit(0);
    })
    .catch((error: unknown): void => {
        console.error('Setup failed:', error);
        console.log('\nPlease check your database configuration and permissions');
        process.exit(1);
    });
