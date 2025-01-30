import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import {
  User,
  CreateUserDTO,
  RecentOrder,
} from '../types';
import { passwordUtils } from '../middleware/auth.middleware';

export class UserStore {
  constructor(private client: Pool) {}

  async findByEmail(
    email: string
  ): Promise<Omit<User, 'password_digest'> | null> {
    try {
      const sql = `
        SELECT id, first_name, last_name, email 
        FROM users 
        WHERE email = $1
      `;
      const conn = await this.client.connect();
      const result = await conn.query(sql, [email]);
      conn.release();

      // If no user is found, return null
      if (result.rows.length === 0) {
        return null;
      }

      // Return the found user (without password_digest)
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user by email: ${err}`);
    }
  }

  async create(
    userData: CreateUserDTO
  ): Promise<Omit<User, 'password_digest'>> {
    try {
      const pepper = passwordUtils.getPepper();
      const saltRounds = passwordUtils.getSaltRounds();
      const hash = bcrypt.hashSync(userData.password + pepper, saltRounds);

      const sql = `
                INSERT INTO users (first_name, last_name, email, password_digest)
                VALUES ($1, $2, $3, $4)
                RETURNING id, first_name, last_name, email
            `;

      const conn = await this.client.connect();

      const existingUser = await conn.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length) {
        throw new Error('Email already exists');
      }

      const result = await conn.query(sql, [
        userData.first_name,
        userData.last_name,
        userData.email,
        hash,
      ]);
      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create user. Error: ${err}`);
    }
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const conn = await this.client.connect();
      const sql = 'SELECT * FROM users WHERE email = $1';

      const result = await conn.query(sql, [email]);
      conn.release();

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const pepper = passwordUtils.getPepper();

      const isValid = bcrypt.compareSync(
        password + pepper,
        user.password_digest
      );

      return isValid ? user : null;
    } catch (err) {
      throw new Error(`Authentication error: ${err}`);
    }
  }

  async index(): Promise<Omit<User, 'password_digest'>[]> {
    try {
      const conn = await this.client.connect();
      const sql =
        'SELECT id, first_name, last_name, email FROM users ORDER BY id';
      const result = await conn.query(sql);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    }
  }

  async show(id: number): Promise<Omit<User, 'password_digest'>> {
    try {
      const sql =
        'SELECT id, first_name, last_name, email FROM users WHERE id = $1';
      const conn = await this.client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user ${id}. Error: ${err}`);
    }
  }

  async update(
    id: number,
    userData: Partial<Omit<CreateUserDTO, 'password'>>
  ): Promise<Omit<User, 'password_digest'>> {
    try {
      const conn = await this.client.connect();

      const updates: string[] = [];
      const values: (string | number)[] = [];
      let paramCount = 1;

      if (userData.first_name) {
        updates.push(`first_name = $${paramCount}`);
        values.push(userData.first_name);
        paramCount++;
      }
      if (userData.last_name) {
        updates.push(`last_name = $${paramCount}`);
        values.push(userData.last_name);
        paramCount++;
      }
      if (userData.email) {
        const existingUser = await conn.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [userData.email, id]
        );
        if (existingUser.rows.length) {
          throw new Error('Email already exists');
        }
        updates.push(`email = $${paramCount}`);
        values.push(userData.email);
        paramCount++;
      }

      if (updates.length === 0) {
        throw new Error('No valid fields provided for update');
      }

      values.push(id);
      const sql = `
                UPDATE users 
                SET ${updates.join(', ')} 
                WHERE id = $${paramCount}
                RETURNING id, first_name, last_name, email
            `;

      const result = await conn.query(sql, values);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update user ${id}. Error: ${err}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const conn = await this.client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }
    } catch (err) {
      throw new Error(`Could not delete user ${id}. Error: ${err}`);
    }
  }

  async getRecentOrders(userId: number): Promise<RecentOrder[]> {
    try {
      const sql = `
                SELECT 
                    o.id, 
                    o.status::order_status as status,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'product_id', op.product_id,
                                'quantity', op.quantity
                            )
                        ) FILTER (WHERE op.id IS NOT NULL),
                        '[]'
                    ) as products
                FROM orders o
                LEFT JOIN order_products op ON o.id = op.order_id
                WHERE o.user_id = $1
                GROUP BY o.id, o.status
                ORDER BY o.id DESC
                LIMIT 5
            `;

      const conn = await this.client.connect();
      const result = await conn.query<RecentOrder>(sql, [userId]);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get recent orders for user ${userId}. Error: ${err}`
      );
    }
  }
}
