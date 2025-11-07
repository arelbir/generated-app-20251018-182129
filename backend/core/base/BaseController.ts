/**
 * Base Controller Class (OCP + LSP)
 * Generic HTTP request/response handling for all entities
 * Extends this class for domain-specific controllers
 */
import { Request, Response, NextFunction } from 'express';
import { IService } from '../interfaces/IService';
import { PaginationParams } from '../interfaces/IRepository';
import { ResponseFormatter } from '../types/ApiResponse';
import { PaginationHelper } from '../types/PaginationParams';

export abstract class BaseController<T> {
  constructor(protected service: IService<T>) {}

  /**
   * GET /entities - List all entities with pagination
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('BaseController.getAll called', {
        query: req.query,
        path: req.path
      });

      const params = this.extractPaginationParams(req);
      const result = await this.service.getAll(params);

      const response = ResponseFormatter.paginated(
        result.items,
        result.totalCount,
        result.page,
        result.limit
      );

      console.log('BaseController.getAll completed', {
        count: result.items.length,
        totalCount: result.totalCount
      });

      res.json(response);
    } catch (error) {
      console.error('BaseController.getAll failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /entities/:id - Get single entity
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      console.log('BaseController.getById called', { id });

      const entity = await this.service.getById(id);
      const response = ResponseFormatter.success(entity);

      console.log('BaseController.getById completed', { id });

      res.json(response);
    } catch (error) {
      const { id } = req.params;
      console.error('BaseController.getById failed', { id: id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /entities - Create new entity
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;

      console.log('BaseController.create called', {
        data: JSON.stringify(data),
        user: (req as any).user?.id
      });

      const entity = await this.service.create(data);
      const response = ResponseFormatter.success(entity);

      console.log('BaseController.create completed', {
        id: (entity as any).id
      });

      res.status(201).json(response);
    } catch (error) {
      console.error('BaseController.create failed', { error: (error as Error).message });
      next(error);
    }
  }

  /**
   * PUT /entities/:id - Update entity
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      console.log('BaseController.update called', {
        id,
        data: JSON.stringify(data),
        user: (req as any).user?.id
      });

      const entity = await this.service.update(id, data);
      const response = ResponseFormatter.success(entity);

      console.log('BaseController.update completed', { id });

      res.json(response);
    } catch (error) {
      const { id } = req.params;
      console.error('BaseController.update failed', { id: id, error: (error as Error).message });
      next(error);
    }
  }

  /**
   * DELETE /entities/:id - Delete entity
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      console.log('BaseController.delete called', {
        id,
        user: (req as any).user?.id
      });

      await this.service.delete(id);
      const response = ResponseFormatter.noContent();

      console.log('BaseController.delete completed', { id });

      res.status(204).json(response);
    } catch (error) {
      const { id } = req.params;
      console.error('BaseController.delete failed', { id: id, error: (error as Error).message });
      next(error);
    }
  }

  /**
   * Extract pagination parameters from request
   * DRY: Consistent parameter extraction
   */
  protected extractPaginationParams(req: Request): PaginationParams {
    return PaginationHelper.extractFromRequest(req.query);
  }

  /**
   * Extract user from request (after authentication middleware)
   * Utility method for controllers that need user context
   */
  protected getUserFromRequest(req: Request): any {
    return (req as any).user;
  }

  /**
   * Check if user has specific role
   * Utility method for authorization checks
   */
  protected hasRole(req: Request, role: string): boolean {
    const user = this.getUserFromRequest(req);
    return user?.role === role;
  }

  /**
   * Check if user is admin
   * Common authorization check
   */
  protected isAdmin(req: Request): boolean {
    return this.hasRole(req, 'admin');
  }

  /**
   * Check if user owns the resource or is admin
   * Common pattern for user-scoped resources
   */
  protected canAccessResource(req: Request, resourceOwnerId: string): boolean {
    const user = this.getUserFromRequest(req);
    return user?.id === resourceOwnerId || this.isAdmin(req);
  }

  /**
   * Send success response
   * DRY: Consistent response formatting
   */
  protected sendSuccess(res: Response, data: any, statusCode: number = 200): void {
    const response = ResponseFormatter.success(data);
    res.status(statusCode).json(response);
  }

  /**
   * Send paginated success response
   * DRY: Consistent paginated response formatting
   */
  protected sendPaginatedSuccess(
    res: Response,
    items: any[],
    totalCount: number,
    page: number,
    limit: number
  ): void {
    const response = ResponseFormatter.paginated(items, totalCount, page, limit);
    res.json(response);
  }

  /**
   * Send no content response
   */
  protected sendNoContent(res: Response): void {
    const response = ResponseFormatter.noContent();
    res.status(204).json(response);
  }

  /**
   * Send bad request response
   */
  protected sendBadRequest(res: Response, message: string): void {
    res.status(400).json(ResponseFormatter.error(message));
  }

  /**
   * Send not found response
   */
  protected sendNotFound(res: Response, message: string): void {
    res.status(404).json(ResponseFormatter.error(message));
  }

  /**
   * Send forbidden response
   */
  protected sendForbidden(res: Response, message: string): void {
    res.status(403).json(ResponseFormatter.error(message));
  }
}
