import { Request, Response } from 'express';
import { dbPool } from '../server';
import { UserModel } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { SignupRequest, LoginRequest, UserProfile } from '../types/user.types';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    const { first_name, last_name, email, password } =
      req.body as SignupRequest;

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      res.status(400).json({
        error:
          'All fields are required: first_name, last_name, email, password',
      });
      return;
    }

    if (!AuthService.validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      const userModel = new UserModel(client);

      if (await userModel.checkEmailExists(email)) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const user: UserProfile = await userModel.create(
        { first_name, last_name, email },
        hashedPassword
      );

      await client.query('COMMIT');

      const token = AuthService.generateToken(user);

      res.status(201).json({
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as LoginRequest;

    if (!email?.trim() || !password) {
      res.status(400).json({
        error: 'Email and password are required',
        details: !email?.trim() ? 'Email is missing' : 'Password is missing',
      });
      return;
    }

    if (!AuthService.validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const userModel = new UserModel(client);
      const user = await userModel.findByEmail(email);

      if (
        !user ||
        !(await AuthService.verifyPassword(password, user.password_digest))
      ) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = AuthService.generateToken(user);

      res.json({
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
}
