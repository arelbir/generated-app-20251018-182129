/**
 * Member Controller
 * HTTP request/response handling for Member domain
 * Extends BaseController for common HTTP operations
 */
import { BaseController } from '../../core/base/BaseController';
import { Member, MemberProfile, MemberSearchDTO } from './member.types';
import { MemberService } from './member.service';
import { Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../../core/types/ApiResponse';
import { logger } from '../../utils';

export class MemberController extends BaseController<Member> {
  constructor(protected service: MemberService) {
    super(service);
  }

  /**
   * GET /api/members/search - Search members with advanced filtering
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('MemberController.search called', { query: req.query.q });

      // Extract search parameters
      const searchParams: MemberSearchDTO = {
        query: req.query.q as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      };

      const result = await this.service.searchMembers(searchParams);
      const response = ResponseFormatter.paginated(
        result.items,
        result.totalCount,
        result.page,
        result.limit
      );

      logger.debug('MemberController.search completed', { count: result.items.length });
      res.json(response);
    } catch (error) {
      logger.error('MemberController.search failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/members/:id/profile - Get complete member profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('MemberController.getProfile called', { id });

      const profile = await this.service.getMemberProfile(id);
      const response = ResponseFormatter.success(profile);

      logger.debug('MemberController.getProfile completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('MemberController.getProfile failed', { id: id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/members/:id/deactivate - Deactivate member (soft delete)
   */
  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('MemberController.deactivate called', { id, user: (req as any).user?.id });

      await this.service.deactivate(id);
      const response = ResponseFormatter.success({ message: 'Üye başarıyla devre dışı bırakıldı' });

      logger.debug('MemberController.deactivate completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('MemberController.deactivate failed', { id: id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/members/statistics - Get member statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('MemberController.getStatistics called');

      // Check admin permission
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Bu işlem için admin yetkisi gerekli');
      }

      const stats = await this.service.getStatistics();
      const response = ResponseFormatter.success(stats);

      logger.debug('MemberController.getStatistics completed', stats);
      res.json(response);
    } catch (error) {
      logger.error('MemberController.getStatistics failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/members/bulk-update-status - Bulk update member status
   */
  bulkUpdateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids, status } = req.body;
      logger.debug('MemberController.bulkUpdateStatus called', {
        count: ids?.length,
        status,
        user: (req as any).user?.id
      });

      // Check admin permission
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Bu işlem için admin yetkisi gerekli');
      }

      // Validate input
      if (!Array.isArray(ids) || ids.length === 0) {
        return this.sendBadRequest(res, 'Geçerli üye ID listesi gerekli');
      }

      if (!['active', 'demo', 'inactive'].includes(status)) {
        return this.sendBadRequest(res, 'Geçerli durum gerekli');
      }

      const updatedCount = await this.service.bulkUpdateStatus(ids, status);
      const response = ResponseFormatter.success({
        message: `${updatedCount} üye durumu güncellendi`,
        updatedCount
      });

      logger.debug('MemberController.bulkUpdateStatus completed', { updatedCount });
      res.json(response);
    } catch (error) {
      logger.error('MemberController.bulkUpdateStatus failed', { error: (error as Error).message });
      next(error);
    }
  };

  // Override base methods for additional logging or custom behavior

  /**
   * Override create for additional logging
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Member creation requested', {
        email: req.body?.email,
        user: (req as any).user?.id
      });

      // Check admin permission for member creation
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Üye oluşturmak için admin yetkisi gerekli');
      }

      await super.create(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Override update for additional authorization checks
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user can access this member
      if (!this.canAccessResource(req, id) && !this.isAdmin(req)) {
        return this.sendForbidden(res, 'Bu üyeyi düzenlemek için yetkiniz yok');
      }

      await super.update(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Override delete for additional authorization checks
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Only admin can delete members
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Üye silmek için admin yetkisi gerekli');
      }

      await super.delete(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  protected isAdmin(req: Request): boolean {
    return (req as any).user?.roleId === 'admin';
  }
}
