export interface CreateUserDTO {
  first_name: string;
  last_name: string;
  email: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_digest: string;
}

export interface UpdateUserDTO {
  first_name: string;
  last_name: string;
  email: string;
  password_digest: string;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}