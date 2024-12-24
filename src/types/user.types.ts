// User types and DTO for creating new records

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CreateUserDTO {
  first_name: string;
  last_name: string;
  password: string;
  email: string;
}
