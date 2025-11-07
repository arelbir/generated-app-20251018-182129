/**
 * Session Controller
 * HTTP request/response handling for Session domain
 * Extends BaseController for common HTTP operations
 */
import { BaseController } from '../../core/base/BaseController';
import { Session, SessionWithMember, SessionSearchDTO } from './session.types';
import { SessionService } from './session.service';
import { Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../../core/types/ApiResponse';
import { logger } from '../../utils';

export class SessionController extends BaseController<Session> {
  constructor(protected service: SessionService) {
    super(service);
  }

  /**
   * GET /api/sessions/search - Search sessions with advanced filtering
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('SessionController.search called', { query: req.query.q });

      const searchParams: SessionSearchDTO = {
        query: req.query.q as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      };

      const result = await this.service.searchSessions(searchParams);
      const response = ResponseFormatter.paginated(
        result.items,
        result.totalCount,
        result.page,
        result.limit
      );

      logger.debug('SessionController.search completed', { count: result.items.length });
      res.json(response);
    } catch (error) {
      logger.error('SessionController.search failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/sessions/upcoming - Get upcoming sessions
   */
  getUpcoming = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('SessionController.getUpcoming called');

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await this.service.getUpcomingSessions(limit);

      const response = ResponseFormatter.success(sessions);

      logger.debug('SessionController.getUpcoming completed', { count: sessions.length });
      res.json(response);
    } catch (error) {
      logger.error('SessionController.getUpcoming failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/sessions/:id/member - Get session with member details
   */
  getWithMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('SessionController.getWithMember called', { id });

      const session = await this.service.getSessionWithMember(id);
      if (!session) {
        return this.sendNotFound(res, 'Seans bulunamadı');
      }

      const response = ResponseFormatter.success(session);

      logger.debug('SessionController.getWithMember completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('SessionController.getWithMember failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/sessions/:id/start - Start session (check-in)
   */
  startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('SessionController.startSession called', { id, user: (req as any).user?.id });

      const session = await this.service.startSession(id);
      const response = ResponseFormatter.success(session);

      logger.debug('SessionController.startSession completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('SessionController.startSession failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/sessions/:id/complete - Complete session
   */
  completeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('SessionController.completeSession called', { id, user: (req as any).user?.id });

      const session = await this.service.completeSession(id);
      const response = ResponseFormatter.success(session);

      logger.debug('SessionController.completeSession completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('SessionController.completeSession failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  // Override base methods for additional authorization

  /**
   * Override create for admin-only access
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Session creation requested', {
        memberId: req.body?.memberId,
        subDeviceId: req.body?.subDeviceId,
        user: (req as any).user?.id
      });

      // Check admin permission for session creation
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Seans oluşturmak için admin yetkisi gerekli');
      }

      await super.create(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Override update for authorization checks
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Only admin can update sessions
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Seans düzenlemek için admin yetkisi gerekli');
      }

      await super.update(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Override delete for admin-only access
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Only admin can delete sessions
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Seans silmek için admin yetkisi gerekli');
      }

      await super.delete(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  // Helper methods for common HTTP responses

  protected sendNotFound(res: Response, message: string): void {
    super.sendNotFound(res, message);
  }

  protected sendForbidden(res: Response, message: string): void {
    super.sendForbidden(res, message);
  }

  protected isAdmin(req: Request): boolean {
    return (req as any).user?.roleId === 'admin';
  }
}
