import { PoolClient } from 'pg';
import { CreateUserDTO, UpdateUserDTO, UserProfile, User } from '../types/user.types';

export class UserModel {
  constructor(private client: PoolClient) {}

  // For ADMIN - currently used only for testing
  async findAll(): Promise<User[]> {
    const result = await this.client.query(
      'SELECT id, first_name, last_name FROM users ORDER BY id ASC'
    );
    return result.rows;
  }

  async findById(id: number): Promise<UserProfile | null> {
    const result = await this.client.query(
      'SELECT id, first_name, last_name, email, password_digest FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const result = await this.client.query(
      'SELECT id, first_name, last_name, email, password_digest FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(
    userData: CreateUserDTO,
    hashedPassword: string
  ): Promise<UserProfile> {
    const result = await this.client.query(
      `INSERT INTO users (first_name, last_name, email, password_digest) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name, email, password_digest`,
      [
        userData.first_name.trim(),
        userData.last_name.trim(),
        userData.email.trim(),
        hashedPassword,
      ]
    );
    return result.rows[0];
  }

  async update(id: number, data: UpdateUserDTO): Promise<UserProfile | null> {
    const setClause = Object.entries(data)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value !== undefined)
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.values(data).filter((value) => value !== undefined);
    if (!values.length) return this.findById(id);

    const result = await this.client.query(
      `UPDATE users 
       SET ${setClause}
       WHERE id = $1
       RETURNING id, first_name, last_name, email, password_digest`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    const result = await this.client.query(
      'UPDATE users SET password_digest = $1 WHERE id = $2',
      [hashedPassword, id]
    );
    return result.rowCount > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.client.query('DELETE FROM users WHERE id = $1', [
      id,
    ]);
    return result.rowCount > 0;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await this.client.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows.length > 0;
  }

  async findOrdersByUser(
    userId: number
  ): Promise<
    {
      id: number;
      status: string;
      products: { id: number; product_id: number; quantity: number }[];
    }[]
  > {
    const result = await this.client.query(
      `SELECT 
        o.id, o.status,
        json_agg(
          json_build_object(
            'id', op.id,
            'product_id', op.product_id,
            'quantity', op.quantity
          )
        ) as products
       FROM orders o
       LEFT JOIN order_products op ON o.id = op.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [userId]
    );
    return result.rows;
  }
}
