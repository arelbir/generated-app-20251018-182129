/**
 * Staff Controller
 * HTTP request/response handling for Staff domain
 * Extends BaseController for common HTTP operations
 */
import { BaseController } from '../../core/base/BaseController';
import { Staff, StaffWithSpecialization, StaffWithSchedule, StaffSearchDTO } from './staff.types';
import { StaffService } from './staff.service';
import { Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../../core/types/ApiResponse';
import { logger } from '../../utils';

export class StaffController extends BaseController<Staff> {
  constructor(protected service: StaffService) {
    super(service);
  }

  /**
   * GET /api/staff/search - Search staff with advanced filtering
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('StaffController.search called', { query: req.query.q });

      const searchParams: StaffSearchDTO = {
        query: req.query.q as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        filters: req.query.filters ? JSON.parse(req.query.filters as string) : undefined
      };

      const result = await this.service.searchStaff(searchParams);
      const response = ResponseFormatter.paginated(
        result.items,
        result.totalCount,
        result.page,
        result.limit
      );

      logger.debug('StaffController.search completed', { count: result.items.length });
      res.json(response);
    } catch (error) {
      logger.error('StaffController.search failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/staff/active - Get all active staff members
   */
  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('StaffController.getActive called');

      const page = req.query.page ? parseInt(req.query.page as string) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      // Use search with active filter
      const searchParams: StaffSearchDTO = {
        filters: { isActive: true },
        page,
        limit,
        sortBy: 'fullName',
        sortOrder: 'asc'
      };

      const result = await this.service.searchStaff(searchParams);
      const response = ResponseFormatter.paginated(
        result.items,
        result.totalCount,
        result.page,
        result.limit
      );

      logger.debug('StaffController.getActive completed', { count: result.items.length });
      res.json(response);
    } catch (error) {
      logger.error('StaffController.getActive failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/staff/:id/specialization - Get staff with specialization details
   */
  getWithSpecialization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('StaffController.getWithSpecialization called', { id });

      const staff = await this.service.getStaffWithSpecialization(id);
      if (!staff) {
        return this.sendNotFound(res, 'Personel bulunamadı');
      }

      const response = ResponseFormatter.success(staff);

      logger.debug('StaffController.getWithSpecialization completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('StaffController.getWithSpecialization failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/staff/:id/schedule - Get staff with schedule information
   */
  getWithSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('StaffController.getWithSchedule called', { id });

      const staff = await this.service.getStaffWithSchedule(id);
      if (!staff) {
        return this.sendNotFound(res, 'Personel bulunamadı');
      }

      const response = ResponseFormatter.success(staff);

      logger.debug('StaffController.getWithSchedule completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('StaffController.getWithSchedule failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/staff/:id/performance - Get staff performance statistics
   */
  getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('StaffController.getPerformance called', { id });

      // Check admin permission for performance data
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Performans verilerini görüntülemek için admin yetkisi gerekli');
      }

      const performance = await this.service.getStaffPerformance(id);
      const response = ResponseFormatter.success(performance);

      logger.debug('StaffController.getPerformance completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('StaffController.getPerformance failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * GET /api/staff/available - Get available staff for scheduling
   */
  getAvailable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { dateTime, duration } = req.query;
      logger.debug('StaffController.getAvailable called', { dateTime, duration });

      if (!dateTime || !duration) {
        return this.sendBadRequest(res, 'dateTime ve duration parametreleri gerekli');
      }

      const availableStaff = await this.service.getAvailableStaff(
        dateTime as string,
        parseInt(duration as string)
      );

      const response = ResponseFormatter.success(availableStaff);

      logger.debug('StaffController.getAvailable completed', { count: availableStaff.length });
      res.json(response);
    } catch (error) {
      logger.error('StaffController.getAvailable failed', { error: (error as Error).message });
      next(error);
    }
  };

  /**
   * PUT /api/staff/:id/working-hours - Update staff working hours
   */
  updateWorkingHours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { workingHours } = req.body;
      logger.debug('StaffController.updateWorkingHours called', { id });

      // Check admin permission
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Çalışma saatlerini güncellemek için admin yetkisi gerekli');
      }

      const updatedStaff = await this.service.updateWorkingHours(id, workingHours);
      const response = ResponseFormatter.success(updatedStaff);

      logger.debug('StaffController.updateWorkingHours completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('StaffController.updateWorkingHours failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  /**
   * POST /api/staff/:id/deactivate - Deactivate staff member
   */
  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      logger.debug('StaffController.deactivate called', { id, user: (req as any).user?.id });

      // Check admin permission
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Personeli devre dışı bırakmak için admin yetkisi gerekli');
      }

      await this.service.deactivate(id);
      const response = ResponseFormatter.success({ message: 'Personel başarıyla devre dışı bırakıldı' });

      logger.debug('StaffController.deactivate completed', { id });
      res.json(response);
    } catch (error) {
      const { id } = req.params;
      logger.error('StaffController.deactivate failed', { id, error: (error as Error).message });
      next(error);
    }
  };

  // Override base methods for additional authorization

  /**
   * Override create for admin-only access
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Staff creation requested', {
        email: req.body?.email,
        user: (req as any).user?.id
      });

      // Check admin permission for staff creation
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Personel oluşturmak için admin yetkisi gerekli');
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

      // Only admin can update staff
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Personeli düzenlemek için admin yetkisi gerekli');
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

      // Only admin can delete staff
      if (!this.isAdmin(req)) {
        return this.sendForbidden(res, 'Personeli silmek için admin yetkisi gerekli');
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
