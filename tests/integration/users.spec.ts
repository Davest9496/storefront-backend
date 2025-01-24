import { Pool } from 'pg';
import { UserModel } from '../../src/models/user.model';
import { testUsers } from '../fixtures/users';
import { truncateTables, closePool } from '../helpers/database';

describe('UserModel Integration Tests', () => {
  let pool: Pool;
  let userModel: UserModel;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB_TEST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
    });
    const client = await pool.connect();
    userModel = new UserModel(client);
  });

  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await closePool();
  });

  it('should create a new user', async () => {
    const hashedPassword = 'hashedpass123';
    const user = await userModel.create(testUsers[0], hashedPassword);
    expect(user.first_name).toBe(testUsers[0].first_name);
    expect(user.last_name).toBe(testUsers[0].last_name);
    expect(user.email).toBe(testUsers[0].email);
  });

  it('should find user by email', async () => {
    const hashedPassword = 'hashedpass123';
    await userModel.create(testUsers[0], hashedPassword);
    const foundUser = await userModel.findByEmail(testUsers[0].email);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(testUsers[0].email);
  });
});
