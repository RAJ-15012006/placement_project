export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
