/**
 * Package Controller
 * HTTP request/response handling for Package domain
 * Extends BaseController for common HTTP operations
 */
import { BaseController } from '../../core/base/BaseController';
import { Package, PackageWithMember, PackageWithUsage, PackageSearchDTO, PackageUsageDTO, PackageExtensionDTO } from './package.types';
import { PackageService } from './package.service';
import { Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../../core/types/ApiResponse';
import { logger } from '../../utils';

export class PackageController extends BaseController<Package> {
  constructor(protected service: PackageService) {
    super(service);
  }

  /**
   * GET /api/packages/search - Search packages with advanced filtering
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('PackageController.search called', { query: req.query.q });

      const searchParams: PackageSearchDTO = {
        query: req.query.q as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      };

      const result = await this.service.searchPackages(searchParams);
      const response = ResponseFormatter.paginated(
        result.items,
        result.totalCount,
        result.page,
        result.limit
      );

      logger.debug('PackageController.search completed', { count: result.items.length });
      res.json(response);
    } catch (error) {
      logger.error('PackageController.search failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/packages/expiring - Get packages expiring soon
   */
  getExpiring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('PackageController.getExpiring called');

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const packages = await this.service.getExpiringPackages(limit);

      const response = ResponseFormatter.success(packages);

      logger.debug('PackageController.getExpiring completed', { count: packages.length });
      res.json(response);
    } catch (error) {
      logger.error('PackageController.getExpiring failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/packages/stats - Get package statistics
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('PackageController.getStats called');

      // Check admin permission
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Paket istatistiklerini görüntülemek için admin yetkisi gerekli');
      }

      const stats = await this.service.getPackageStats();
      const response = ResponseFormatter.success(stats);

      logger.debug('PackageController.getStats completed', stats);
      res.json(response);
    } catch (error) {
      logger.error('PackageController.getStats failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/packages/member/:memberId - Get packages by member
   */
  getByMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { memberId } = req.params;
      const { active } = req.query;
      logger.debug('PackageController.getByMember called', { memberId, active });

      let packages: Package[];
      if (active === 'true') {
        packages = await this.service.getActivePackagesByMember(memberId);
      } else {
        packages = await this.service.getPackagesByMember(memberId);
      }

      const response = ResponseFormatter.success(packages);

      logger.debug('PackageController.getByMember completed', { memberId, count: packages.length });
      res.json(response);
    } catch (error) {
      const { memberId } = req.params;
      logger.error('PackageController.getByMember failed', { memberId, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/packages/:id/member - Get package with member details
   */
  getWithMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('PackageController.getWithMember called', { id });

      const packageData = await this.service.getPackageWithMember(id);
      if (!packageData) {
        return this.sendNotFound(res, 'Paket bulunamadı');
      }

      const response = ResponseFormatter.success(packageData);

      logger.debug('PackageController.getWithMember completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('PackageController.getWithMember failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/packages/:id/usage - Get package with usage statistics
   */
  getWithUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('PackageController.getWithUsage called', { id });

      const packageData = await this.service.getPackageWithUsage(id);
      if (!packageData) {
        return this.sendNotFound(res, 'Paket bulunamadı');
      }

      const response = ResponseFormatter.success(packageData);

      logger.debug('PackageController.getWithUsage completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('PackageController.getWithUsage failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/packages/:id/use - Use sessions from package
   */
  useSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { sessionsToUse, notes } = req.body;
      logger.debug('PackageController.useSessions called', { id, sessionsToUse });

      const usageData: PackageUsageDTO = {
        packageId: id,
        sessionsToUse: parseInt(sessionsToUse),
        notes
      };

      const updatedPackage = await this.service.usePackageSessions(usageData);
      const response = ResponseFormatter.success({
        message: `${sessionsToUse} seans başarıyla kullanıldı`,
        package: updatedPackage
      });

      logger.debug('PackageController.useSessions completed', { id, sessionsToUse });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('PackageController.useSessions failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/packages/:id/extend - Extend package
   */
  extendPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { additionalSessions, newEndDate, notes } = req.body;
      logger.debug('PackageController.extendPackage called', { id, additionalSessions });

      // Check admin permission
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Paket uzatmak için admin yetkisi gerekli');
      }

      const extensionData: PackageExtensionDTO = {
        packageId: id,
        additionalSessions: parseInt(additionalSessions),
        newEndDate,
        notes
      };

      const extendedPackage = await this.service.extendPackage(extensionData);
      const response = ResponseFormatter.success({
        message: `Paket ${additionalSessions} seans ile uzatıldı`,
        package: extendedPackage
      });

      logger.debug('PackageController.extendPackage completed', { id, additionalSessions });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('PackageController.extendPackage failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  // Override base methods for additional authorization

  /**
   * Override create for admin-only access
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Package creation requested', {
        memberId: req.body?.memberId,
        name: req.body?.name,
        user: (req as any).user?.id
      });

      // Check admin permission for package creation
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Paket oluşturmak için admin yetkisi gerekli');
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

      // Only admin can update packages
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Paketi düzenlemek için admin yetkisi gerekli');
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

      // Only admin can delete packages
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Paketi silmek için admin yetkisi gerekli');
      }

      await super.delete(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  // Helper methods for common HTTP responses

  protected sendBadRequest(res: Response, message: string): void {
    super.sendBadRequest(res, message);
  }

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
