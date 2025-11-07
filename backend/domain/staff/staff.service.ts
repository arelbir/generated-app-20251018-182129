/**
 * Staff Service
 * Business logic layer for Staff domain
 * Extends BaseService for common CRUD operations
 */
import { BaseService } from '../../core/base/BaseService';
import { Staff, CreateStaffDTO, UpdateStaffDTO, StaffWithSpecialization, StaffWithSchedule, StaffSearchDTO, StaffPerformance, DEFAULT_WORKING_HOURS } from './staff.types';
import { StaffRepository } from './staff.repository';
import { StaffValidator } from './staff.validator';
import { ValidationError, NotFoundError, ConflictError } from '../../core/types/ErrorTypes';
import { logger } from '../../utils';

export class StaffService extends BaseService<Staff> {
  constructor(
    protected repository: StaffRepository,
    protected validator: StaffValidator
  ) {
    super(repository, validator);
  }

  /**
   * Get resource name for error messages
   */
  protected getResourceName(): string {
    return 'Staff';
  }

  /**
   * Business logic: Create staff with validation
   */
  async create(data: CreateStaffDTO): Promise<Staff> {
    try {
      logger.debug('StaffService.create called', { email: data.email });

      // Validate input
      const validation = this.validator.validateCreate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check for duplicate email
      const existingStaff = await this.repository.findByEmail(validatedData.email);
      if (existingStaff) {
        throw new ConflictError('Bu e-posta adresi ile kayıtlı personel zaten mevcut');
      }

      // Business rule: Set default working hours if not provided
      if (!validatedData.workingHours) {
        validatedData.workingHours = JSON.stringify(DEFAULT_WORKING_HOURS);
      }

      // Apply before create hook
      await this.beforeCreate(validatedData as any);

      // Create staff
      const staff = await this.repository.create(validatedData as any);

      // Apply after create hook
      await this.afterCreate(staff);

      logger.debug('StaffService.create completed', { id: staff.id });
      return staff;
    } catch (error) {
      logger.error('StaffService.create failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Update staff with email uniqueness check
   */
  async update(id: string, data: UpdateStaffDTO): Promise<Staff> {
    try {
      logger.debug('StaffService.update called', { id, data: Object.keys(data) });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Check if staff exists
      const existingStaff = await this.repository.findById(id);
      if (!existingStaff) {
        throw new NotFoundError('Personel bulunamadı');
      }

      // Validate update data
      const validation = this.validator.validateUpdate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check email uniqueness if email is being updated
      if (validatedData.email && validatedData.email !== existingStaff.email) {
        const emailExists = await this.repository.emailExists(validatedData.email, id);
        if (emailExists) {
          throw new ConflictError('Bu e-posta adresi ile kayıtlı personel zaten mevcut');
        }
      }

      // Apply before update hook
      await this.beforeUpdate(id, validatedData as any, existingStaff);

      // Update staff
      const updatedStaff = await this.repository.update(id, validatedData as any);

      // Apply after update hook
      await this.afterUpdate(updatedStaff);

      logger.debug('StaffService.update completed', { id });
      return updatedStaff;
    } catch (error) {
      logger.error('StaffService.update failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get staff with specialization details
   */
  async getStaffWithSpecialization(id: string): Promise<StaffWithSpecialization | null> {
    try {
      logger.debug('StaffService.getStaffWithSpecialization called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      const staff = await this.repository.findWithSpecialization(id);

      logger.debug('StaffService.getStaffWithSpecialization completed', { id, found: !!staff });
      return staff;
    } catch (error) {
      logger.error('StaffService.getStaffWithSpecialization failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get staff with schedule information
   */
  async getStaffWithSchedule(id: string): Promise<StaffWithSchedule | null> {
    try {
      logger.debug('StaffService.getStaffWithSchedule called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      const staff = await this.repository.findWithSchedule(id);

      logger.debug('StaffService.getStaffWithSchedule completed', { id, found: !!staff });
      return staff;
    } catch (error) {
      logger.error('StaffService.getStaffWithSchedule failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Search staff with advanced filtering
   */
  async searchStaff(searchParams: StaffSearchDTO): Promise<any> {
    try {
      logger.debug('StaffService.searchStaff called', { query: searchParams.query });

      const validation = this.validator.validateSearch(searchParams);
      if (!validation.success) {
        throw new ValidationError('Invalid search parameters', validation.errors || []);
      }

      const result = await this.repository.searchStaff(validation.data!);

      logger.debug('StaffService.searchStaff completed', {
        query: searchParams.query,
        count: result.items.length
      });

      return result;
    } catch (error) {
      logger.error('StaffService.searchStaff failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get staff performance statistics
   */
  async getStaffPerformance(id: string): Promise<StaffPerformance> {
    try {
      logger.debug('StaffService.getStaffPerformance called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      const performance = await this.repository.getStaffPerformance(id);

      logger.debug('StaffService.getStaffPerformance completed', { id });
      return performance;
    } catch (error) {
      logger.error('StaffService.getStaffPerformance failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Deactivate staff member
   */
  async deactivate(id: string): Promise<void> {
    try {
      logger.debug('StaffService.deactivate called', { id });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Check if staff exists
      const staff = await this.repository.findById(id);
      if (!staff) {
        throw new NotFoundError('Personel bulunamadı');
      }

      // Business rule: Check if staff can be deactivated
      if (!this.validator.validateStaffDeactivation(staff)) {
        throw new ValidationError('Bu personel devre dışı bırakılamaz (aktif seansları var)');
      }

      // Apply before delete hook
      await this.beforeDelete(id, staff);

      // Soft delete (deactivate)
      const success = await this.repository.update(id, { isActive: false } as any);
      if (!success) {
        throw new NotFoundError('Personel güncellenemedi');
      }

      // Apply after delete hook
      await this.afterDelete(id, staff);

      logger.debug('StaffService.deactivate completed', { id });
    } catch (error) {
      logger.error('StaffService.deactivate failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get available staff for scheduling
   */
  async getAvailableStaff(dateTime: string, duration: number): Promise<Staff[]> {
    try {
      logger.debug('StaffService.getAvailableStaff called', { dateTime, duration });

      const availableStaff = await this.repository.getAvailableStaff(dateTime, duration);

      logger.debug('StaffService.getAvailableStaff completed', { count: availableStaff.length });
      return availableStaff;
    } catch (error) {
      logger.error('StaffService.getAvailableStaff failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Update staff working hours
   */
  async updateWorkingHours(id: string, workingHours: any): Promise<Staff> {
    try {
      logger.debug('StaffService.updateWorkingHours called', { id });

      // Validate working hours format
      if (!this.validator.validateWorkingHours(workingHours)) {
        throw new ValidationError('Geçersiz çalışma saatleri formatı');
      }

      const updatedStaff = await this.repository.update(id, {
        workingHours: JSON.stringify(workingHours)
      } as any);

      logger.debug('StaffService.updateWorkingHours completed', { id });
      return updatedStaff;
    } catch (error) {
      logger.error('StaffService.updateWorkingHours failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  // Business Logic Hooks

  protected async beforeCreate(data: Partial<Staff>): Promise<void> {
    // Business rule: Normalize email
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }

    // Business rule: Set hire date if not provided
    if (!data.hireDate) {
      (data as any).hireDate = new Date().toISOString();
    }
  }

  protected async afterCreate(staff: Staff): Promise<void> {
    logger.info('Staff member created', { staffId: staff.id, name: staff.fullName });
  }

  protected async beforeUpdate(id: string, data: Partial<Staff>, existingStaff: Staff): Promise<void> {
    // Business rule: Normalize email
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }

    // Log important changes
    if (data.isActive !== undefined && data.isActive !== existingStaff.isActive) {
      logger.info('Staff status changed', {
        staffId: id,
        oldStatus: existingStaff.isActive,
        newStatus: data.isActive
      });
    }
  }

  protected async afterUpdate(staff: Staff): Promise<void> {
    logger.info('Staff member updated', { staffId: staff.id, name: staff.fullName });
  }

  protected async beforeDelete(id: string, staff: Staff): Promise<void> {
    logger.warn('Staff member being deactivated', { staffId: id, name: staff.fullName });
  }

  protected async afterDelete(id: string, staff: Staff): Promise<void> {
    logger.info('Staff member deactivated', { staffId: id, name: staff.fullName });
  }
}
