import { AuthService } from '../../../src/services/auth.service';

describe('AuthService', () => {
  const validPassword = 'ValidPass123!';
  const invalidPassword = 'weak';

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
});
