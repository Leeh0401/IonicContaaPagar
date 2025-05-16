export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
  message?: string;
} 