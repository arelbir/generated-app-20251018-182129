/**
 * Member Service
 * Business logic layer for Member domain
 * Extends BaseService for common CRUD operations
 */
import { BaseService } from '../../core/base/BaseService';
import {
  Member,
  CreateMemberDTO,
  UpdateMemberDTO,
  MemberProfile,
  MemberSearchDTO,
  MemberWithSessions,
  MemberWithPackages,
  MemberWithMeasurements
} from './member.types';
import { MemberRepository } from './member.repository';
import { MemberValidator } from './member.validator';
import { IEmailService } from '../../core/interfaces/IEmailService';
import { ValidationError, NotFoundError, ConflictError } from '../../core/types/ErrorTypes';
import { logger } from '../../utils';

export class MemberService extends BaseService<Member> {
  constructor(
    protected repository: MemberRepository,
    protected validator: MemberValidator,
    private emailService?: IEmailService // DIP: Interface dependency
  ) {
    super(repository, validator);
  }

  /**
   * Get resource name for error messages
   */
  protected getResourceName(): string {
    return 'Member';
  }

  /**
   * Business logic: Create member with validation and welcome email
   */
  async create(data: CreateMemberDTO): Promise<Member> {
    try {
      logger.debug('MemberService.create called', { email: data.email });

      // Validate input
      const validation = this.validator.validateCreate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check for duplicate email
      const existingMember = await this.repository.findByEmail(validatedData.email);
      if (existingMember) {
        throw new ConflictError('Bu e-posta adresi ile kayıtlı üye zaten mevcut');
      }

      // Business rule: Validate minimum age (if joinDate is birth date)
      if (validatedData.joinDate) {
        const isOldEnough = this.validator.validateMinimumAge(validatedData.joinDate, 13);
        if (!isOldEnough) {
          throw new ValidationError('Üye 13 yaşından küçük olamaz');
        }
      }

      // Apply before create hook
      await this.beforeCreate(validatedData as any);

      // Create member
      const member = await this.repository.create(validatedData as any);

      // Apply after create hook
      await this.afterCreate(member);

      logger.debug('MemberService.create completed', { id: member.id });
      return member;
    } catch (error) {
      logger.error('MemberService.create failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Update member with email uniqueness check
   */
  async update(id: string, data: UpdateMemberDTO): Promise<Member> {
    try {
      logger.debug('MemberService.update called', { id, data: Object.keys(data) });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Check if member exists
      const existingMember = await this.repository.findById(id);
      if (!existingMember) {
        throw new NotFoundError('Üye bulunamadı');
      }

      // Validate update data
      const validation = this.validator.validateUpdate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check email uniqueness if email is being updated
      if (validatedData.email && validatedData.email !== existingMember.email) {
        const emailExists = await this.repository.emailExists(validatedData.email, id);
        if (emailExists) {
          throw new ConflictError('Bu e-posta adresi ile kayıtlı üye zaten mevcut');
        }
      }

      // Apply before update hook
      await this.beforeUpdate(id, validatedData as any, existingMember);

      // Update member
      const updatedMember = await this.repository.update(id, validatedData as any);

      // Apply after update hook
      await this.afterUpdate(updatedMember);

      logger.debug('MemberService.update completed', { id });
      return updatedMember;
    } catch (error) {
      logger.error('MemberService.update failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get member profile with all related data
   */
  async getMemberProfile(id: string): Promise<MemberProfile> {
    try {
      logger.debug('MemberService.getMemberProfile called', { id });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Get member with relations
      const [memberWithSessions, memberWithPackages, memberWithMeasurements] = await Promise.all([
        this.repository.findWithSessions(id),
        this.repository.findWithPackages(id),
        this.repository.findWithMeasurements(id)
      ]);

      if (!memberWithSessions) {
        throw new NotFoundError('Üye bulunamadı');
      }

      const profile: MemberProfile = {
        ...memberWithSessions,
        packages: memberWithPackages?.packages || [],
        measurements: memberWithMeasurements?.measurements || []
      };

      logger.debug('MemberService.getMemberProfile completed', { id });
      return profile;
    } catch (error) {
      logger.error('MemberService.getMemberProfile failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Search members with advanced filtering
   */
  async searchMembers(searchParams: MemberSearchDTO): Promise<any> {
    try {
      logger.debug('MemberService.searchMembers called', { query: searchParams.query });

      // Validate search parameters
      const validation = this.validator.validateSearch(searchParams);
      if (!validation.success) {
        throw new ValidationError('Invalid search parameters', validation.errors || []);
      }

      const result = await this.repository.searchByName(validation.data!);

      logger.debug('MemberService.searchMembers completed', {
        query: searchParams.query,
        count: result.items.length
      });

      return result;
    } catch (error) {
      logger.error('MemberService.searchMembers failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Deactivate member (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    try {
      logger.debug('MemberService.deactivate called', { id });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Check if member exists
      const member = await this.repository.findById(id);
      if (!member) {
        throw new NotFoundError('Üye bulunamadı');
      }

      // Business rule: Cannot deactivate if has active packages/sessions
      // This would require additional repository methods to check

      // Apply before delete hook
      await this.beforeDelete(id, member);

      // Soft delete
      const success = await this.repository.softDelete(id);
      if (!success) {
        throw new NotFoundError('Üye silinemedi');
      }

      // Apply after delete hook
      await this.afterDelete(id, member);

      logger.debug('MemberService.deactivate completed', { id });
    } catch (error) {
      logger.error('MemberService.deactivate failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get member statistics
   */
  async getStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    demoMembers: number;
    inactiveMembers: number;
  }> {
    try {
      logger.debug('MemberService.getStatistics called');
      const stats = await this.repository.getStatistics();
      logger.debug('MemberService.getStatistics completed', stats);
      return stats;
    } catch (error) {
      logger.error('MemberService.getStatistics failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Bulk update member status
   */
  async bulkUpdateStatus(ids: string[], status: 'active' | 'demo' | 'inactive'): Promise<number> {
    try {
      logger.debug('MemberService.bulkUpdateStatus called', { count: ids.length, status });

      // Validate all IDs
      const invalidIds = ids.filter(id => {
        const validation = this.validator.validateId(id);
        return !validation.success;
      });

      if (invalidIds.length > 0) {
        throw new ValidationError(`Invalid IDs: ${invalidIds.join(', ')}`);
      }

      const updatedCount = await this.repository.bulkUpdateStatus(ids, status);

      logger.debug('MemberService.bulkUpdateStatus completed', { updatedCount });
      return updatedCount;
    } catch (error) {
      logger.error('MemberService.bulkUpdateStatus failed', { error: (error as Error).message });
      throw error;
    }
  }

  // Business Logic Hooks (Template Method Pattern)

  /**
   * Before create hook - additional business rules
   */
  protected async beforeCreate(data: Partial<Member>): Promise<void> {
    // Business rule: Set default join date if not provided
    if (!data.joinDate) {
      (data as any).joinDate = new Date().toISOString();
    }

    // Business rule: Normalize phone number
    if (data.phone) {
      data.phone = this.normalizePhoneNumber(data.phone);
    }
  }

  /**
   * After create hook - side effects
   */
  protected async afterCreate(member: Member): Promise<void> {
    // Side effect: Send welcome email
    if (this.emailService) {
      try {
        await this.emailService.sendWelcomeEmail(member.email, member.fullName);
        logger.info('Welcome email sent', { memberId: member.id, email: member.email });
      } catch (error) {
        logger.error('Failed to send welcome email', { memberId: member.id, error: (error as Error).message });
        // Don't throw - email failure shouldn't break member creation
      }
    }
  }

  /**
   * Before update hook - additional business rules
   */
  protected async beforeUpdate(id: string, data: Partial<Member>, existingMember: Member): Promise<void> {
    // Business rule: Normalize phone number if being updated
    if (data.phone) {
      data.phone = this.normalizePhoneNumber(data.phone);
    }
  }

  /**
   * After update hook - side effects
   */
  protected async afterUpdate(member: Member): Promise<void> {
    // Side effect: Log important status changes
    logger.info('Member updated', { memberId: member.id, status: member.status });
  }

  /**
   * Before delete hook - check dependencies
   */
  protected async beforeDelete(id: string, member: Member): Promise<void> {
    // Business rule: Check for active sessions/packages before deactivation
    // This would require additional repository methods
    logger.warn('Member being deactivated', { memberId: id, name: member.fullName });
  }

  /**
   * After delete hook - cleanup
   */
  protected async afterDelete(id: string, member: Member): Promise<void> {
    // Side effect: Send deactivation notification
    if (this.emailService) {
      try {
        await this.emailService.sendAccountDeactivationEmail(member.email, member.fullName);
        logger.info('Deactivation email sent', { memberId: id, email: member.email });
      } catch (error) {
        logger.error('Failed to send deactivation email', { memberId: id, error: (error as Error).message });
      }
    }
  }

  // Helper Methods (DRY)

  /**
   * Normalize Turkish phone number
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    let cleanPhone = phone.replace(/[^\d+]/g, '');

    // Ensure it starts with 0 for Turkish numbers
    if (cleanPhone.startsWith('+90')) {
      cleanPhone = cleanPhone.replace('+90', '0');
    }

    return cleanPhone;
  }
}
