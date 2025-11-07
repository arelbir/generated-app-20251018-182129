/**
 * Measurement Controller
 * HTTP handlers for Measurements domain
 */
import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../core/base/BaseController';
import { ResponseFormatter } from '../../core/types/ApiResponse';
import { MeasurementService } from './measurement.service';
import { MeasurementSearchDTO, Measurement } from './measurement.types';
import { logger } from '../../utils';

export class MeasurementController extends BaseController<Measurement> {
  constructor(protected service: MeasurementService) {
    super(service);
  }

  /**
   * GET /api/measurements/member/:memberId
   */
  getByMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { memberId } = req.params;
      logger.debug('MeasurementController.getByMember called', { memberId });

      const measurements = await this.service.getMeasurementsByMember(memberId);
      this.sendSuccess(res, measurements);
    } catch (error) {
      logger.error('MeasurementController.getByMember failed', {
        memberId: req.params.memberId,
        error: (error as Error).message
      });
      next(error);
    }
  };

  /**
   * GET /api/measurements/member/:memberId/latest
   */
  getLatestByMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { memberId } = req.params;
      logger.debug('MeasurementController.getLatestByMember called', { memberId });

      const measurement = await this.service.getLatestByMember(memberId);
      if (!measurement) {
        res.status(404).json(ResponseFormatter.error('Ölçüm bulunamadı'));
        return;
      }

      this.sendSuccess(res, measurement);
    } catch (error) {
      logger.error('MeasurementController.getLatestByMember failed', {
        memberId: req.params.memberId,
        error: (error as Error).message
      });
      next(error);
    }
  };

  /**
   * GET /api/measurements/search
   */
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug('MeasurementController.search called', { query: req.query });

      const searchParams: MeasurementSearchDTO = {
        memberId: req.query.memberId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        minWeight: req.query.minWeight ? parseFloat(req.query.minWeight as string) : undefined,
        maxWeight: req.query.maxWeight ? parseFloat(req.query.maxWeight as string) : undefined,
        minBodyFat: req.query.minBodyFat ? parseFloat(req.query.minBodyFat as string) : undefined,
        maxBodyFat: req.query.maxBodyFat ? parseFloat(req.query.maxBodyFat as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as MeasurementSearchDTO['sortBy'],
        sortOrder: req.query.sortOrder as MeasurementSearchDTO['sortOrder']
      };

      const result = await this.service.search(searchParams);
      this.sendPaginatedSuccess(res, result.items, result.totalCount, result.page, result.limit);
    } catch (error) {
      logger.error('MeasurementController.search failed', {
        error: (error as Error).message
      });
      next(error);
    }
  };
}
