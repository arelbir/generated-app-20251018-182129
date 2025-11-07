import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT Secret (production'da environment variable'dan alınmalı)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Extend Express Request interface
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

export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  fullName: string;
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Authentication middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user as AuthUser;
    next();
  });
}

// Optional authentication (for routes that work with or without auth)
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user as AuthUser;
      }
      next();
    });
  } else {
    next();
  }
}

// Role-based authorization middleware
export function requireRole(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!requiredRoles.includes(req.user.roleId)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Permission-based authorization middleware
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // TODO: Check user permissions from database
    // For now, allow all authenticated users
    next();
  };
}
