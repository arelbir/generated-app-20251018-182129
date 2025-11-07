/**
 * Generic Controller Interface (SRP + DIP)
 * Defines HTTP request/response handling operations
 * Part of Interface Segregation Principle (ISP)
 */
import { Request, Response, NextFunction } from 'express';

export interface IController<T> {
  /**
   * Handle GET /entities - List all entities with pagination
   */
  getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Handle GET /entities/:id - Get single entity
   */
  getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Handle POST /entities - Create new entity
   */
  create: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Handle PUT /entities/:id - Update entity
   */
  update: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Handle DELETE /entities/:id - Delete entity
   */
  delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

/**
 * Extended Controller Interface for additional operations
 * Follows Open/Closed Principle (OCP) - can be extended without modification
 */
export interface IExtendedController<T> extends IController<T> {
  /**
   * Handle GET /entities/search - Search entities
   */
  search?: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Handle POST /entities/:id/action - Custom actions
   */
  customAction?: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
