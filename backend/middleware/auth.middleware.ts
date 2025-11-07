/**
 * Authentication Middleware
 * JWT token verification and role-based access control
 */
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../core/types/ErrorTypes';

// Extend Express Request type - must match auth.ts definition
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      roleId: string;
      fullName: string;
    };
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  // TODO: Implement JWT verification
  // For now, mock authentication
  req.user = {
    id: 'mock-user-id',
    email: 'admin@morfistudio.com',
    roleId: 'admin',
    fullName: 'Admin User'
  };

  next();
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (req.user.roleId !== role && req.user.roleId !== 'admin') {
      return next(new ForbiddenError(`Requires ${role} role`));
    }

    next();
  };
};
