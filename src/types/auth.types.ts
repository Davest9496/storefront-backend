export interface TokenPayload {
  id: number;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: number;
  firstName: string;
  lastName: string;
}
