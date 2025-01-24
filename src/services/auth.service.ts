import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SecurityConfig } from '../config/security.config';
import { UserResponse } from '../types/user.types';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password + SecurityConfig.password.pepper,
      SecurityConfig.password.saltRounds
    );
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(
      password + SecurityConfig.password.pepper,
      hashedPassword
    );
  }

  static generateToken(user: {
    id: number;
    first_name: string;
    last_name: string;
  }): string {
    return jwt.sign(
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
  }

  static validateToken(token: string): UserResponse | null {
    try {
      const decoded = jwt.verify(token, SecurityConfig.jwt.secret as string, {
        algorithms: [SecurityConfig.jwt.algorithm],
      }) as {
        id: number;
        firstName: string;
        lastName: string;
        iat: number;
        exp: number;
      };

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
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
  }

  static validatePassword(password: string): {
    isValid: boolean;
    error?: string;
  } {
    if (password.length < SecurityConfig.password.minLength) {
      return {
        isValid: false,
        error: `Password must be at least ${SecurityConfig.password.minLength} characters long`,
      };
    }

    if (
      SecurityConfig.password.requireSpecialChar &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        isValid: false,
        error:
          'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
      };
    }

    if (SecurityConfig.password.requireNumber && !/\d/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number',
      };
    }

    return { isValid: true };
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
