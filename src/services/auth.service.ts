import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserDTO, User } from '../types';
import { generateToken, passwordUtils } from '../middleware/auth.middleware';

// Interface for password reset token payload
interface ResetTokenPayload {
  userId: number;
  email: string;
  exp: number;
}

export class AuthService {
  constructor(private client: Pool) {}

  async register(
    userData: CreateUserDTO
  ): Promise<{ user: Omit<User, 'password_digest'>; token: string }> {
    try {
      // Hash password using bcrypt with pepper
      const pepper = passwordUtils.getPepper();
      const saltRounds = passwordUtils.getSaltRounds();
      const hash = bcrypt.hashSync(userData.password + pepper, saltRounds);

      const sql = `
                INSERT INTO users (first_name, last_name, email, password_digest)
                VALUES ($1, $2, $3, $4)
                RETURNING id, first_name, last_name, email
            `;

      const conn = await this.client.connect();

      // Check if email already exists
      const existingUser = await conn.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length) {
        throw new Error('Email already registered');
      }

      const result = await conn.query(sql, [
        userData.first_name,
        userData.last_name,
        userData.email,
        hash,
      ]);
      conn.release();

      const user = result.rows[0];
      const token = generateToken(user.id, user.email);

      return {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        token,
      };
    } catch (err) {
      throw new Error(`Could not register user. Error: ${err}`);
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password_digest'>; token: string }> {
    try {
      const conn = await this.client.connect();
      const sql = 'SELECT * FROM users WHERE email = $1';

      const result = await conn.query(sql, [email]);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];
      const pepper = passwordUtils.getPepper();

      // Verify password
      const isValid = bcrypt.compareSync(
        password + pepper,
        user.password_digest
      );

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      return {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        token,
      };
    } catch (err) {
      throw new Error(`Could not authenticate user. Error: ${err}`);
    }
  }

  async generateResetToken(email: string): Promise<string> {
    try {
      const conn = await this.client.connect();
      const result = await conn.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );
      conn.release();

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Generate a special reset token that expires in 1 hour
      return jwt.sign(
        {
          userId: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        },
        process.env.JWT_SECRET as string
      );
    } catch (err) {
      throw new Error(`Could not generate reset token. Error: ${err}`);
    }
  }

  async validateResetToken(token: string): Promise<ResetTokenPayload> {
    try {
      // Verify and decode the reset token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as ResetTokenPayload;

      // Verify the user still exists
      const conn = await this.client.connect();
      const result = await conn.query(
        'SELECT id FROM users WHERE id = $1 AND email = $2',
        [decoded.userId, decoded.email]
      );
      conn.release();

      if (result.rows.length === 0) {
        throw new Error('Invalid reset token');
      }

      return decoded;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid reset token');
      }
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error('Reset token has expired');
      }
      throw new Error(`Could not validate reset token: ${err}`);
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const conn = await this.client.connect();
      const user = await conn.query(
        'SELECT password_digest FROM users WHERE id = $1',
        [userId]
      );

      if (user.rows.length === 0) {
        throw new Error('User not found');
      }

      const pepper = passwordUtils.getPepper();
      const isValid = bcrypt.compareSync(
        oldPassword + pepper,
        user.rows[0].password_digest
      );

      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = passwordUtils.getSaltRounds();
      const newHash = bcrypt.hashSync(newPassword + pepper, saltRounds);

      // Update password
      await conn.query('UPDATE users SET password_digest = $1 WHERE id = $2', [
        newHash,
        userId,
      ]);

      conn.release();
    } catch (err) {
      throw new Error(`Could not change password. Error: ${err}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Validate the reset token first
      const decoded = await this.validateResetToken(token);

      // Hash the new password
      const pepper = passwordUtils.getPepper();
      const saltRounds = passwordUtils.getSaltRounds();
      const hash = bcrypt.hashSync(newPassword + pepper, saltRounds);

      // Update the password
      const conn = await this.client.connect();
      await conn.query('UPDATE users SET password_digest = $1 WHERE id = $2', [
        hash,
        decoded.userId,
      ]);
      conn.release();
    } catch (err) {
      throw new Error(`Could not reset password: ${err}`);
    }
  }
}
