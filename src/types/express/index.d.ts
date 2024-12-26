import { JWTPayload } from '../config/security';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JWTPayload;
  }
}
