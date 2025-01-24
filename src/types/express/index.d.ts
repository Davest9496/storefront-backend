import { JWTPayload } from '../config/security';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
