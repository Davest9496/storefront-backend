//-- Centraliszed Config object for security-related constants
import dotenev from 'dotenv';

dotenev.config();

export const SecurityConfig = {
  // JWT configuaration
  jwt: {
    secret: process.env.TOKEN_SECRET,
    expiresIn: '1h',
    algorithm: 'HS256' as const,
  },

  // Password hasshing config
  password: {
    pepper: process.env.PEPPER,
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10'),

    //-- For stronger password enforcement --//
    // minLength: 8,
    // requireSpecialChar: true,
    // requireNumber: true,
    // requireUpperCase: true
  },
};
