import { QueryResult } from 'pg';
import { query } from '../config/database.config';
import bcrypt from 'bcrypt';
import { User, CreateUserDTO } from '../types/shared.types';
import { passwordUtils } from '../middleware/auth.middleware';

export class UserStore {
  async index(): Promise<User[]> {
    try {
      const sql = 'SELECT id, first_name, last_name, email FROM users';
      const result: QueryResult<User> = await query<User>(sql);
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get users. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async show(id: number): Promise<User | null> {
    try {
      const sql =
        'SELECT id, first_name, last_name, email FROM users WHERE id = $1';
      const result: QueryResult<User> = await query<User>(sql, [id]);

      return result.rows.length ? result.rows[0] : null;
    } catch (err) {
      throw new Error(
        `Error querying user ${id}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async create(userData: CreateUserDTO): Promise<User> {
    try {
      // Check if email already exists
      const emailCheck: QueryResult<Pick<User, 'id'>> = await query<
        Pick<User, 'id'>
      >('SELECT id FROM users WHERE email = $1', [userData.email]);

      if (emailCheck.rows.length) {
        throw new Error('Email already exists');
      }

      // Hash password with pepper and salt
      const pepper = passwordUtils.getPepper();
      const saltRounds = passwordUtils.getSaltRounds();

      // Combine password with pepper before hashing
      const passwordWithPepper = userData.password + pepper;
      const hash = await bcrypt.hash(passwordWithPepper, saltRounds);

      const sql = `
        INSERT INTO users (first_name, last_name, email, password_digest)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email, password_digest`;

      const result: QueryResult<User> = await query<User>(sql, [
        userData.first_name,
        userData.last_name,
        userData.email,
        hash,
      ]);

      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not create user. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const sql = 'SELECT * FROM users WHERE email = $1';
      const result: QueryResult<User> = await query<User>(sql, [email]);

      if (result.rows.length) {
        const user = result.rows[0];
        const pepper = passwordUtils.getPepper();
        const passwordWithPepper = password + pepper;

        const isValid = await bcrypt.compare(
          passwordWithPepper,
          user.password_digest
        );

        if (isValid) {
          return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password_digest: user.password_digest,
          };
        }
      }

      return null;
    } catch (err) {
      throw new Error(
        `Authentication failed. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
