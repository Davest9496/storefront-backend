import { QueryResult } from 'pg';
import { query } from '../config/database.config';
import bcrypt from 'bcrypt';
import {
  User,
  CreateUserDTO,
  RecentOrder,
  UpdateUserDTO,
  UpdatePasswordDTO
} from '../types/shared.types';

// Define the UserPasswordRow type
type UserPasswordRow = {
  password_digest: string;
};

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
      const emailCheck = await query<Pick<User, 'id'>>(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

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
        RETURNING id, first_name, last_name, email`;

      const result = await query<User>(sql, [
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

  async update(id: number, updates: UpdateUserDTO): Promise<User> {
    try {
      // Check if user exists
      const userExists = await this.show(id);
      if (!userExists) {
        throw new Error('User not found');
      }

      // If email is being updated, check if new email already exists
      if (updates.email) {
        const emailCheck = await query<Pick<User, 'id'>>(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [updates.email, id]
        );
        if (emailCheck.rows.length) {
          throw new Error('Email already exists');
        }
      }

      // Build dynamic update query
      const validUpdates = Object.entries(updates).filter(
        ([, value]) => value !== undefined
      );

      const setClauses = validUpdates.map(
        ([key], index) => `${key} = $${index + 1}`
      );
      const values = validUpdates.map(([, value]) => value);

      if (setClauses.length === 0) {
        throw new Error('No valid updates provided');
      }

      const sql = `
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE id = $${values.length + 1}
        RETURNING id, first_name, last_name, email`;

      const result = await query<User>(sql, [...values, id]);

      if (result.rows.length === 0) {
        throw new Error('User not found after update');
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(
        `Could not update user ${id}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async updatePassword(
    id: number,
    passwords: UpdatePasswordDTO
  ): Promise<void> {
    try {
      // Get user with password hash
      const sql = 'SELECT password_digest FROM users WHERE id = $1';
      const result = await query<UserPasswordRow>(sql, [id]);

      if (!result.rows.length) {
        throw new Error('User not found');
      }

      const user = result.rows[0];
      const pepper = passwordUtils.getPepper();

      // Verify current password
      const isValid = await bcrypt.compare(
        passwords.current_password + pepper,
        user.password_digest
      );

      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = passwordUtils.getSaltRounds();
      const newHash = await bcrypt.hash(
        passwords.new_password + pepper,
        saltRounds
      );

      // Update password
      await query('UPDATE users SET password_digest = $1 WHERE id = $2', [
        newHash,
        id,
      ]);
    } catch (err) {
      throw new Error(
        `Could not update password. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      if (!result.rows.length) {
        throw new Error('User not found');
      }
    } catch (err) {
      throw new Error(
        `Could not delete user ${id}. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async getRecentOrders(userId: number): Promise<RecentOrder[]> {
    try {
      const sql = `
        SELECT 
          o.id,
          o.status,
          json_agg(
            json_build_object(
              'product_id', op.product_id,
              'quantity', op.quantity
            )
          ) as products
        FROM orders o
        JOIN order_products op ON o.id = op.order_id
        WHERE o.user_id = $1
        GROUP BY o.id, o.status
        ORDER BY o.id DESC
        LIMIT 5`;

      const result = await query<RecentOrder>(sql, [userId]);
      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get recent orders. Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const sql = 'SELECT * FROM users WHERE email = $1';
      const result = await query<User>(sql, [email]);

      if (result.rows.length) {
        const user = result.rows[0];
        const pepper = passwordUtils.getPepper();
        const isValid = await bcrypt.compare(
          password + pepper,
          user.password_digest
        );

        if (isValid) {
          // Destructure and omit password_digest from returned user data
          // password_digest is part of the User Interface and cannot be left out
          // eslint-disable-next-line
          const { password_digest: _, ...userWithoutPassword } = user;
          return userWithoutPassword as User;
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
