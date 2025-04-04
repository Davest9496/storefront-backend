import { Pool, PoolClient } from 'pg';
import { config } from 'dotenv';

// Initialize environment variables
config();

// Type definitions using TypeScript interfaces for better type safety
interface DatabaseConfig {
  readonly host: string;
  readonly database: string;
  readonly user: string;
  readonly password: string | undefined;
  readonly port: number;
}

interface DatabaseCheckResult {
  readonly datname: string;
}

// Database configuration factory with explicit return type
const createDatabaseConfig = (database: string): DatabaseConfig => ({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  database,
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Database verification class with strongly typed methods
class DatabaseVerifier {
  private readonly initialPool: Pool;
  private readonly requiredDatabases: readonly string[];

  public constructor() {
    this.initialPool = new Pool(createDatabaseConfig('postgres'));
    this.requiredDatabases = ['storefront_dev', 'storefront_test'] as const;
  }

  private async verifyExistingDatabases(
    client: PoolClient
  ): Promise<Set<string>> {
    // Query to check existing databases using parameterized query for safety
    const dbCheckQuery = `
    SELECT datname 
    FROM pg_database 
    WHERE datname = ANY($1)
  `;

    const dbCheckResult = await client.query<DatabaseCheckResult>(
      dbCheckQuery,
      [this.requiredDatabases]
    );

    // Explicitly type the Set as Set<string>
    const existingDatabases = new Set<string>(
      dbCheckResult.rows.map((row) => row.datname)
    );

    // Log existing databases for verification
    console.log(
      '\nExisting databases:',
      Array.from(existingDatabases).join(', ')
    );

    return existingDatabases;
  }

  private async createMissingDatabases(
    client: PoolClient,
    existingDatabases: Set<string>
  ): Promise<void> {
    // Create promises for all missing databases
    const createDbPromises = this.requiredDatabases
      .filter((dbName) => !existingDatabases.has(dbName))
      .map(async (dbName) => {
        console.log(`\nCreating ${dbName} database...`);
        // Use template literal for query but dbName is safe as it's from a fixed array
        await client.query(`CREATE DATABASE ${dbName}`);
        console.log(`Successfully created ${dbName} database`);
      });

    await Promise.all(createDbPromises);
  }

  private async grantPrivileges(client: PoolClient): Promise<void> {
    const currentUser = process.env.POSTGRES_USER ?? 'postgres';

    // Create promises for granting privileges to all databases
    const grantPromises = this.requiredDatabases.map(async (dbName) => {
      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${currentUser}`
      );
    });

    await Promise.all(grantPromises);
    console.log('\nDatabase privileges granted successfully');
  }

  private async testDevConnection(): Promise<void> {
    const devPool = new Pool(createDatabaseConfig('storefront_dev'));
    const devClient = await devPool.connect();

    try {
      console.log('\nSuccessfully connected to storefront_dev database');
    } finally {
      // Ensure proper cleanup of database connections
      await devClient.release();
      await devPool.end();
    }
  }

  public async verify(): Promise<void> {
    let client: PoolClient | null = null;

    try {
      console.log('Attempting to connect to PostgreSQL...');
      client = await this.initialPool.connect();
      console.log('Successfully connected to PostgreSQL');

      const existingDatabases = await this.verifyExistingDatabases(client);
      await this.createMissingDatabases(client, existingDatabases);
      await this.grantPrivileges(client);
      await this.testDevConnection();

      console.log('\n✅ Database setup verification completed successfully!');
    } catch (error) {
      // Log error with proper type checking
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('\n❌ Error during database verification:', errorMessage);
      throw error;
    } finally {
      // Ensure proper cleanup even if there's an error
      if (client) {
        await client.release();
      }
      await this.initialPool.end();
    }
  }
}

// Main execution function with explicit return type
const runVerification = async (): Promise<void> => {
  try {
    const verifier = new DatabaseVerifier();
    await verifier.verify();
    console.log('Setup complete - databases are ready to use');
    process.exit(0);
  } catch (error) {
    // Enhanced error handling with proper type checking
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Setup failed:', errorMessage);
    console.log('\nPlease check your database configuration and permissions');
    process.exit(1);
  }
};

// Execute the verification
void runVerification();
