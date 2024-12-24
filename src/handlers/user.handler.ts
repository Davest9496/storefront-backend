import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { SecurityConfig } from '../config/security.config';
import { CreateUserDTO } from '../types/user.types';
import bcrypt from 'bcrypt';
import { dbPool } from '../server';

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await dbPool.connect();
    try {
      const result = await client.query(
        'SELECT id, first_name, last_name FROM users'
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.log('Error fetching users:', error);
    res.status(501).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const client = await dbPool.connect();

    try {
      const result = await client.query(
        'SELECT id, first_name, last_name FROM users WHERE id=$1',
        [userId]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      }
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.log('Error fetching user data:', error);
    res.status(500).json({ details: 'Internal server Error' });
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, email, password }: CreateUserDTO = req.body;

  // Validate inputs
  if (!first_name || !last_name || !email || !password) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  // Validate password strength
  if (password.length < SecurityConfig.password.minLength) {
    res.status(400).json({
      error: `Password must be at least ${SecurityConfig.password.minLength} characters long`,
    });
    return;
  }

  // Password Hashing
  const pepper = SecurityConfig.password.pepper;
  const saltRounds = SecurityConfig.password.saltRounds;
  const hashedPassword = await bcrypt.hash(password + pepper, saltRounds);

  const client = await dbPool.connect();
  try {
    // Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create user
    const result = await client.query(
      'INSERT INTO users (first_name, last_name, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name',
      [first_name, last_name, email, hashedPassword]
    );
    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      SecurityConfig.jwt.secret!,
      {
        expiresIn: SecurityConfig.jwt.expiresIn,
      }
    );

    res.status(201).json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
