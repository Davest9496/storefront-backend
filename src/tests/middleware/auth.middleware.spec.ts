import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  generateToken,
  verifyAuthToken,
  verifyUserAuthorization,
  passwordUtils,
} from '../../middleware/auth.middleware';

dotenv.config();

describe('Authentication Middleware Tests', () => {
  // Mock Express objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      headers: {},
      params: {},
    };
    mockResponse = {
      status: jasmine
        .createSpy()
        .and.returnValue({ json: jasmine.createSpy() }),
      json: jasmine.createSpy(),
    };
    nextFunction = jasmine.createSpy();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      // Test data
      const userId = 1;
      const email = 'test@example.com';

      // Generate token
      const token = generateToken(userId, email);

      // Verify token structure and content
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { user: { id: number; email: string } };
      expect(decoded.user.id).toBe(userId);
      expect(decoded.user.email).toBe(email);
    });

    it('should throw error if JWT_SECRET is not set', () => {
      // Temporarily remove JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = '';

      expect(() => {
        generateToken(1, 'test@example.com');
      }).toThrow();

      // Restore JWT_SECRET
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyAuthToken', () => {
    it('should pass valid token', () => {
      // Generate valid token
      const token = generateToken(1, 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      verifyAuthToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(1);
    });

    it('should reject request without authorization header', () => {
      verifyAuthToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      verifyAuthToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('verifyUserAuthorization', () => {
    it('should allow access to own resources', () => {
      mockRequest.user = { id: 1, email: 'test@example.com' };
      mockRequest.params = { id: '1' };

      verifyUserAuthorization(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access to other users resources', () => {
      mockRequest.user = { id: 1, email: 'test@example.com' };
      mockRequest.params = { id: '2' };

      verifyUserAuthorization(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('passwordUtils', () => {
    it('should get pepper value from environment', () => {
      expect(passwordUtils.getPepper()).toBeDefined();
      expect(typeof passwordUtils.getPepper()).toBe('string');
    });

    it('should get salt rounds from environment', () => {
      expect(passwordUtils.getSaltRounds()).toBeDefined();
      expect(typeof passwordUtils.getSaltRounds()).toBe('number');
    });

    it('should use default salt rounds if not set', () => {
      // Temporarily remove SALT_ROUNDS
      const originalSaltRounds = process.env.SALT_ROUNDS;
      delete process.env.SALT_ROUNDS;

      expect(passwordUtils.getSaltRounds()).toBe(10);

      // Restore SALT_ROUNDS
      process.env.SALT_ROUNDS = originalSaltRounds;
    });
  });
});
