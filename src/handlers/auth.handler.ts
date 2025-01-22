import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dbPool } from '../server';
import { SecurityConfig } from '../config/security.config';
import {
  SignupRequest,
  LoginRequest,
  UserResponse,
  AuthResponse,
} from '../types/user.types';

// Signup endpoint handler
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, email, password } = req.body as SignupRequest;

  // Enhanced input validation with trimming to prevent whitespace-only inputs
  if (
    !first_name?.trim() ||
    !last_name?.trim() ||
    !email?.trim() ||
    !password
  ) {
    res.status(400).json({
      error: 'All fields are required: first_name, last_name, email, password',
    });
    return;
  }

  // Email format validation with comprehensive regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  // Enhanced password validation
  if (password.length < SecurityConfig.password.minLength) {
    res.status(400).json({
      error: `Password must be at least ${SecurityConfig.password.minLength} characters long`,
    });
    return;
  }

  // Special character validation with clear messaging
  if (
    SecurityConfig.password.requireSpecialChar &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    res.status(400).json({
      error:
        'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
    });
    return;
  }

  // Number validation
  if (SecurityConfig.password.requireNumber && !/\d/.test(password)) {
    res.status(400).json({
      error: 'Password must contain at least one number',
    });
    return;
  }

  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    // Check for existing user with case-insensitive email comparison
    const existingUser = await client.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Password hashing with pepper and salt rounds from config
    const hashedPassword = await bcrypt.hash(
      password + SecurityConfig.password.pepper,
      SecurityConfig.password.saltRounds
    );

    // Insert new user with trimmed inputs
    const result = await client.query(
      `INSERT INTO users (first_name, last_name, email, password_digest) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name`,
      [first_name.trim(), last_name.trim(), email.trim(), hashedPassword]
    );

    await client.query('COMMIT');

    const user = result.rows[0];

    // Generate JWT token with standardized payload
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        iat: Math.floor(Date.now() / 1000),
      },
      SecurityConfig.jwt.secret as string,
      {
        expiresIn: SecurityConfig.jwt.expiresIn,
        algorithm: SecurityConfig.jwt.algorithm,
      }
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    };

    res.status(201).json(response);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Signup error:', error);

    if ((error as { code?: string }).code === '23505') {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    client.release();
  }
};

// Login endpoint handler
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequest;

  // Input validation with helpful error messages
  if (!email?.trim() || !password) {
    res.status(400).json({
      error: 'Email and password are required',
      details: !email?.trim() ? 'Email is missing' : 'Password is missing',
    });
    return;
  }

  // Email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  const client = await dbPool.connect();
  try {
    console.log('Login attempt for email:', email);

    // Find user by email with case-insensitive search
    const result = await client.query(
      'SELECT id, first_name, last_name, password_digest FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    console.log('User found:', result.rows.length > 0);

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Password verification with pepper
    const isValid = await bcrypt.compare(
      password + SecurityConfig.password.pepper,
      user.password_digest
    );

    console.log('Password verification result:', isValid);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token with standardized payload
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        iat: Math.floor(Date.now() / 1000),
      },
      SecurityConfig.jwt.secret as string,
      {
        expiresIn: SecurityConfig.jwt.expiresIn,
        algorithm: SecurityConfig.jwt.algorithm,
      }
    );

    const response: AuthResponse = {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Token validation helper
export const validateToken = (token: string): UserResponse | null => {
  try {
    // Verify token with explicit typing
    const decoded = jwt.verify(token, SecurityConfig.jwt.secret as string, {
      algorithms: [SecurityConfig.jwt.algorithm],
    }) as {
      id: number;
      firstName: string;
      lastName: string;
      iat: number;
      exp: number;
    };

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('Token expired');
      return null;
    }

    return {
      id: decoded.id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};
