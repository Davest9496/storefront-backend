import { AuthenticatedUser } from '../authenticatedUser.types';
// Extend express Request type to include user property and make it globally accessible.

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
