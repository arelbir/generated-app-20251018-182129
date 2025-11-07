/**
 * Measurement Service
 * Business logic for Measurements domain
 */
import { BaseService } from '../../core/base/BaseService';
import { Measurement, CreateMeasurementDTO, UpdateMeasurementDTO, MeasurementSearchDTO } from './measurement.types';
import { MeasurementRepository } from './measurement.repository';
import { MeasurementValidator } from './measurement.validator';
import { ValidationError, ConflictError, NotFoundError } from '../../core/types/ErrorTypes';
import { logger } from '../../utils';

export class MeasurementService extends BaseService<Measurement> {
  constructor(
    protected repository: MeasurementRepository,
    protected validator: MeasurementValidator
  ) {
    super(repository, validator);
  }

  protected getResourceName(): string {
    return 'Measurement';
  }

  async create(data: CreateMeasurementDTO): Promise<Measurement> {
    logger.debug('MeasurementService.create called', { memberId: data.memberId, date: data.date });

    const validation = this.validator.validateCreate(data);
    if (!validation.success || !validation.data) {
      throw new ValidationError('Validation failed', validation.errors || []);
    }

    const existingMeasurement = await this.repository.findByMemberAndDate(validation.data.memberId, validation.data.date);
    if (existingMeasurement) {
      throw new ConflictError('Bu tarihte kayıtlı ölçüm zaten mevcut');
    }

    await this.beforeCreate(validation.data);
    const measurement = await this.repository.create(validation.data);
    await this.afterCreate(measurement);

    logger.debug('MeasurementService.create completed', { id: measurement.id });
    return measurement;
  }

  async update(id: string, data: UpdateMeasurementDTO): Promise<Measurement> {
    logger.debug('MeasurementService.update called', { id, fields: Object.keys(data) });

    const idValidation = this.validator.validateId(id);
    if (!idValidation.success) {
      throw new ValidationError('Invalid ID', idValidation.errors || []);
    }

    const existingMeasurement = await this.repository.findById(id);
    if (!existingMeasurement) {
      throw new NotFoundError('Measurement not found');
    }

    const validation = this.validator.validateUpdate(data);
    if (!validation.success || !validation.data) {
      throw new ValidationError('Validation failed', validation.errors || []);
    }

    if (validation.data.date && validation.data.date !== existingMeasurement.date) {
      const duplicate = await this.repository.findByMemberAndDate(existingMeasurement.memberId, validation.data.date);
      if (duplicate) {
        throw new ConflictError('Bu tarihte kayıtlı ölçüm zaten mevcut');
      }
    }

    await this.beforeUpdate(id, validation.data, existingMeasurement);
    const updated = await this.repository.update(id, validation.data);
    await this.afterUpdate(updated);

    logger.debug('MeasurementService.update completed', { id });
    return updated;
  }

  async search(params: MeasurementSearchDTO) {
    logger.debug('MeasurementService.search called', { ...params });

    const validation = this.validator.validateSearch(params);
    if (!validation.success || !validation.data) {
      throw new ValidationError('Invalid search parameters', validation.errors || []);
    }

    const result = await this.repository.searchMeasurements(validation.data);

    logger.debug('MeasurementService.search completed', { count: result.items.length });
    return result;
  }

  async getLatestByMember(memberId: string): Promise<Measurement | null> {
    logger.debug('MeasurementService.getLatestByMember called', { memberId });

    const idValidation = this.validator.validateId(memberId);
    if (!idValidation.success) {
      throw new ValidationError('Invalid member ID', idValidation.errors || []);
    }

    const measurement = await this.repository.findLatestByMember(memberId);

    logger.debug('MeasurementService.getLatestByMember completed', { found: !!measurement });
    return measurement;
  }

  async getMeasurementsByMember(memberId: string): Promise<Measurement[]> {
    logger.debug('MeasurementService.getMeasurementsByMember called', { memberId });

    const idValidation = this.validator.validateId(memberId);
    if (!idValidation.success) {
      throw new ValidationError('Invalid member ID', idValidation.errors || []);
    }

    const measurements = await this.repository.findByMember(memberId);

    logger.debug('MeasurementService.getMeasurementsByMember completed', { count: measurements.length });
    return measurements;
  }
}
