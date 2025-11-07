/**
 * Package Service
 * Business logic layer for Package domain
 * Extends BaseService for common CRUD operations
 */
import { BaseService } from '../../core/base/BaseService';
import { Package, CreatePackageDTO, UpdatePackageDTO, PackageWithMember, PackageWithUsage, PackageSearchDTO, PackageUsageDTO, PackageExtensionDTO, PackageStats } from './package.types';
import { PackageRepository } from './package.repository';
import { PackageValidator } from './package.validator';
import { ValidationError, NotFoundError, ConflictError } from '../../core/types/ErrorTypes';
import { logger } from '../../utils';

export class PackageService extends BaseService<Package> {
  constructor(
    protected repository: PackageRepository,
    protected validator: PackageValidator
  ) {
    super(repository, validator);
  }

  /**
   * Get resource name for error messages
   */
  protected getResourceName(): string {
    return 'Package';
  }

  /**
   * Business logic: Create package with validation
   */
  async create(data: CreatePackageDTO): Promise<Package> {
    try {
      logger.debug('PackageService.create called', { memberId: data.memberId, name: data.name });

      // Validate input
      const validation = this.validator.validateCreate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Check if member exists (would need member repository)
      // const memberExists = await memberRepository.exists(validatedData.memberId);
      // if (!memberExists) {
      //   throw new NotFoundError('Üye bulunamadı');
      // }

      // Business rule: Check for overlapping packages of same device type
      // This would require additional repository methods

      // Apply before create hook
      await this.beforeCreate(validatedData as any);

      // Create package
      const packageData = await this.repository.create({
        ...validatedData,
        sessionsRemaining: validatedData.totalSessions,
        isActive: true
      } as any);

      // Apply after create hook
      await this.afterCreate(packageData);

      logger.debug('PackageService.create completed', { id: packageData.id });
      return packageData;
    } catch (error) {
      logger.error('PackageService.create failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Update package with business rules
   */
  async update(id: string, data: UpdatePackageDTO): Promise<Package> {
    try {
      logger.debug('PackageService.update called', { id, data: Object.keys(data) });

      // Validate ID
      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      // Check if package exists
      const existingPackage = await this.repository.findById(id);
      if (!existingPackage) {
        throw new NotFoundError('Paket bulunamadı');
      }

      // Business rule: Cannot modify expired packages
      if (new Date(existingPackage.endDate) < new Date()) {
        throw new ValidationError('Süresi dolmuş paketler düzenlenemez');
      }

      // Validate update data
      const validation = this.validator.validateUpdate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Business rule: Ensure sessionsRemaining doesn't exceed totalSessions
      if (validatedData.totalSessions !== undefined && validatedData.sessionsRemaining !== undefined) {
        if (validatedData.sessionsRemaining > validatedData.totalSessions) {
          throw new ValidationError('Kalan seans sayısı toplam seans sayısından fazla olamaz');
        }
      }

      // Apply before update hook
      await this.beforeUpdate(id, validatedData as any, existingPackage);

      // Update package
      const updatedPackage = await this.repository.update(id, validatedData as any);

      // Apply after update hook
      await this.afterUpdate(updatedPackage);

      logger.debug('PackageService.update completed', { id });
      return updatedPackage;
    } catch (error) {
      logger.error('PackageService.update failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get package with member details
   */
  async getPackageWithMember(id: string): Promise<PackageWithMember | null> {
    try {
      logger.debug('PackageService.getPackageWithMember called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      const packageData = await this.repository.findWithMember(id);

      logger.debug('PackageService.getPackageWithMember completed', { id, found: !!packageData });
      return packageData;
    } catch (error) {
      logger.error('PackageService.getPackageWithMember failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get package with usage statistics
   */
  async getPackageWithUsage(id: string): Promise<PackageWithUsage | null> {
    try {
      logger.debug('PackageService.getPackageWithUsage called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors || []);
      }

      const packageData = await this.repository.findWithUsage(id);

      logger.debug('PackageService.getPackageWithUsage completed', { id, found: !!packageData });
      return packageData;
    } catch (error) {
      logger.error('PackageService.getPackageWithUsage failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Search packages with advanced filtering
   */
  async searchPackages(searchParams: PackageSearchDTO): Promise<any> {
    try {
      logger.debug('PackageService.searchPackages called', { query: searchParams.query });

      const validation = this.validator.validateSearch(searchParams);
      if (!validation.success) {
        throw new ValidationError('Invalid search parameters', validation.errors || []);
      }

      const result = await this.repository.searchPackages(validation.data!);

      logger.debug('PackageService.searchPackages completed', {
        query: searchParams.query,
        count: result.items.length
      });

      return result;
    } catch (error) {
      logger.error('PackageService.searchPackages failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Use sessions from package
   */
  async usePackageSessions(data: PackageUsageDTO): Promise<Package> {
    try {
      logger.debug('PackageService.usePackageSessions called', { packageId: data.packageId, sessionsToUse: data.sessionsToUse });

      // Validate usage data
      const validation = this.validator.validateUsage(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Get package details
      const packageData = await this.repository.findById(validatedData.packageId);
      if (!packageData) {
        throw new NotFoundError('Paket bulunamadı');
      }

      // Validate package can be used
      if (!this.validator.validatePackageUsage(packageData, validatedData.sessionsToUse)) {
        throw new ValidationError('Paket kullanılamaz (süresi dolmuş veya yeterli seans yok)');
      }

      // Use sessions
      const success = await this.repository.useSessions(validatedData.packageId, validatedData.sessionsToUse);
      if (!success) {
        throw new ConflictError('Seans kullanılamadı');
      }

      // Get updated package
      const updatedPackage = await this.repository.findById(validatedData.packageId);

      logger.debug('PackageService.usePackageSessions completed', { packageId: validatedData.packageId });
      return updatedPackage!;
    } catch (error) {
      logger.error('PackageService.usePackageSessions failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Extend package
   */
  async extendPackage(data: PackageExtensionDTO): Promise<Package> {
    try {
      logger.debug('PackageService.extendPackage called', { packageId: data.packageId, additionalSessions: data.additionalSessions });

      // Validate extension data
      const validation = this.validator.validateExtension(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors || []);
      }

      const validatedData = validation.data!;

      // Get package details
      const packageData = await this.repository.findById(validatedData.packageId);
      if (!packageData) {
        throw new NotFoundError('Paket bulunamadı');
      }

      // Validate package can be extended
      if (!this.validator.validatePackageExtension(packageData)) {
        throw new ValidationError('Paket uzatılamaz');
      }

      // Extend package
      const extendedPackage = await this.repository.extendPackage(
        validatedData.packageId,
        validatedData.additionalSessions,
        validatedData.newEndDate
      );

      if (!extendedPackage) {
        throw new ConflictError('Paket uzatılamadı');
      }

      logger.debug('PackageService.extendPackage completed', { packageId: validatedData.packageId });
      return extendedPackage;
    } catch (error) {
      logger.error('PackageService.extendPackage failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get packages by member
   */
  async getPackagesByMember(memberId: string): Promise<Package[]> {
    try {
      logger.debug('PackageService.getPackagesByMember called', { memberId });

      const packages = await this.repository.findByMember(memberId);

      logger.debug('PackageService.getPackagesByMember completed', { memberId, count: packages.length });
      return packages;
    } catch (error) {
      logger.error('PackageService.getPackagesByMember failed', { memberId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get active packages by member
   */
  async getActivePackagesByMember(memberId: string): Promise<Package[]> {
    try {
      logger.debug('PackageService.getActivePackagesByMember called', { memberId });

      const packages = await this.repository.findActiveByMember(memberId);

      logger.debug('PackageService.getActivePackagesByMember completed', { memberId, count: packages.length });
      return packages;
    } catch (error) {
      logger.error('PackageService.getActivePackagesByMember failed', { memberId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get expiring packages
   */
  async getExpiringPackages(limit: number = 50): Promise<Package[]> {
    try {
      logger.debug('PackageService.getExpiringPackages called', { limit });

      const packages = await this.repository.findExpiring(limit);

      logger.debug('PackageService.getExpiringPackages completed', { count: packages.length });
      return packages;
    } catch (error) {
      logger.error('PackageService.getExpiringPackages failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Business logic: Get package statistics
   */
  async getPackageStats(): Promise<PackageStats> {
    try {
      logger.debug('PackageService.getPackageStats called');

      const stats = await this.repository.getPackageStats();

      logger.debug('PackageService.getPackageStats completed', stats);
      return stats;
    } catch (error) {
      logger.error('PackageService.getPackageStats failed', { error: (error as Error).message });
      throw error;
    }
  }

  // Business Logic Hooks

  protected async beforeCreate(data: Partial<Package>): Promise<void> {
    // Set default values
    if (!data.isActive) {
      (data as any).isActive = true;
    }

    // Business rule: Calculate end date if not provided
    // This could be based on package type and session count
    logger.info('Package creation initiated', { memberId: data.memberId, name: data.name });
  }

  protected async afterCreate(packageData: Package): Promise<void> {
    logger.info('Package created', { packageId: packageData.id, memberId: packageData.memberId });
  }

  protected async beforeUpdate(id: string, data: Partial<Package>, existingPackage: Package): Promise<void> {
    // Log important changes
    if (data.isActive !== undefined && data.isActive !== existingPackage.isActive) {
      logger.info('Package status changed', {
        packageId: id,
        oldStatus: existingPackage.isActive,
        newStatus: data.isActive
      });
    }
  }

  protected async afterUpdate(packageData: Package): Promise<void> {
    logger.info('Package updated', { packageId: packageData.id, memberId: packageData.memberId });
  }
}
