import { AuthService } from '../../../src/services/auth.service';
import * as jwt from 'jsonwebtoken';
import { SecurityConfig } from '../../../src/config/security.config';

describe('AuthService', () => {
  const validPassword = 'ValidPass123!';
  const invalidPassword = 'weak';
  const user = { id: 1, first_name: 'John', last_name: 'Doe' };
  const email = 'test@example.com';
  const invalidEmail = 'test@.com';

  it('should validate correct password format', () => {
    const result = AuthService.validatePassword(validPassword);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid password format', () => {
    const result = AuthService.validatePassword(invalidPassword);
    expect(result.isValid).toBe(false);
  });

  it('should hash password correctly', async () => {
    const hashedPassword = await AuthService.hashPassword(validPassword);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(validPassword);
  });

  it('should verify password correctly', async () => {
    const hashedPassword = await AuthService.hashPassword(validPassword);
    const isMatch = await AuthService.verifyPassword(
      validPassword,
      hashedPassword
    );
    expect(isMatch).toBe(true);
  });

  it('should generate a valid token', () => {
    const token = AuthService.generateToken(user);
    const decoded = jwt.verify(token, SecurityConfig.jwt.secret as string);
    expect(decoded).toBeDefined();
    expect((decoded as any).id).toBe(user.id);
  });

  it('should validate a valid token', () => {
    const token = AuthService.generateToken(user);
    const validatedUser = AuthService.validateToken(token);
    expect(validatedUser).toBeDefined();
    expect(validatedUser?.id).toBe(user.id);
  });

  it('should invalidate an expired token', () => {
    const token = jwt.sign(
      {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        iat: Math.floor(Date.now() / 1000) - 3600,
      },
      SecurityConfig.jwt.secret as string,
      { expiresIn: '1h', algorithm: SecurityConfig.jwt.algorithm }
    );
    const validatedUser = AuthService.validateToken(token);
    expect(validatedUser).toBeNull();
  });

  it('should validate correct email format', () => {
    const result = AuthService.validateEmail(email);
    expect(result).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = AuthService.validateEmail(invalidEmail);
    expect(result).toBe(false);
  });
});
