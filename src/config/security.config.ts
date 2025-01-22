import dotenv from 'dotenv';

// Load environment variables at startup
dotenv.config();

// We'll create an interface to define our security configuration structure
interface SecurityConfiguration {
  jwt: {
    secret: string;
    expiresIn: string;
    algorithm: 'HS256';
  };
  password: {
    pepper: string;
    saltRounds: number;
    minLength: number;
    requireSpecialChar: boolean;
    requireNumber: boolean;
    requireUpperCase: boolean;
  };
}

// Function to ensure all required security settings are present
const validateSecurityConfig = () => {
  const requiredEnvVars = ['JWT_SECRET', 'PASSWORD_PEPPER', 'SALT_ROUNDS'];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Run validation immediately
validateSecurityConfig();

// Export our security configuration
export const SecurityConfig: SecurityConfiguration = {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: '24h',
    algorithm: 'HS256',
  },
  password: {
    // The pepper adds an additional layer of security beyond the salt
    pepper: process.env.PASSWORD_PEPPER as string,
    // Salt rounds determine how computationally intensive the hashing will be
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUpperCase: true,
  },
};

// Helper function to verify security configuration
export const verifySecurityConfig = (): boolean => {
  try {
    validateSecurityConfig();
    return true;
  } catch (error) {
    console.error('Security configuration error:', error);
    return false;
  }
};
