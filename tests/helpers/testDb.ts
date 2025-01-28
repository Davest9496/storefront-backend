import { Pool, PoolClient } from 'pg';
import getDBConfig from '../../src/config/db.config';

class TestDb {
  private static pool: Pool | null = null;
  private static clients: PoolClient[] = [];

  static getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool(getDBConfig());
    }
    return this.pool;
  }

  static async getClient(): Promise<PoolClient> {
    const client = await this.getPool().connect();
    this.clients.push(client);
    return client;
  }

  static async closeAll(): Promise<void> {
    // Release all clients
    for (const client of this.clients) {
      if (client) {
        try {
          client.release();
        } catch (error) {
          console.error('Error releasing client:', error);
        }
      }
    }
    this.clients = [];

    // End pool if it exists
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (error) {
        console.error('Error ending pool:', error);
      }
      this.pool = null;
    }
  }
}

export default TestDb;
