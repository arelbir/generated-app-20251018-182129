/**
 * Base Service Class (OCP + LSP)
 * Generic business logic operations for all entities
 * Extends this class for domain-specific services
 */
import { IService } from '../interfaces/IService';
import { PaginationParams, PaginatedResult, IRepository } from '../interfaces/IRepository';
import { IValidator } from '../interfaces/IValidator';
import { NotFoundError, ValidationError } from '../types/ErrorTypes';

export abstract class BaseService<T> implements IService<T> {
  constructor(
    protected repository: IRepository<T>,
    protected validator: IValidator<any, any>
  ) {}

  async getAll(params: PaginationParams): Promise<PaginatedResult<T>> {
    try {
      console.log('BaseService.getAll called', { params });
      const result = await this.repository.findAll(params);
      console.log('BaseService.getAll completed', { count: result.items.length });
      return result;
    } catch (error) {
      console.error('BaseService.getAll failed', { error: (error as Error).message });
      throw error;
    }
  }

  async getById(id: string): Promise<T> {
    try {
      console.log('BaseService.getById called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors);
      }

      const entity = await this.repository.findById(id);
      if (!entity) {
        throw new NotFoundError(this.getResourceName());
      }

      console.log('BaseService.getById completed', { id });
      return entity;
    } catch (error) {
      console.error('BaseService.getById failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  async create(data: any): Promise<T> {
    try {
      console.log('BaseService.create called', { data: JSON.stringify(data) });

      const validation = this.validator.validateCreate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors);
      }

      if (validation.data) {
        await this.beforeCreate(validation.data);
        const entity = await this.repository.create(validation.data);
        await this.afterCreate(entity);
        console.log('BaseService.create completed', { id: (entity as any).id });
        return entity;
      }
      throw new ValidationError('Validation data is undefined');
    } catch (error) {
      console.error('BaseService.create failed', { error: (error as Error).message });
      throw error;
    }
  }

  async update(id: string, data: any): Promise<T> {
    try {
      console.log('BaseService.update called', { id, data: JSON.stringify(data) });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors);
      }

      const existingEntity = await this.repository.findById(id);
      if (!existingEntity) {
        throw new NotFoundError(this.getResourceName());
      }

      const validation = this.validator.validateUpdate(data);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.errors);
      }

      if (validation.data) {
        await this.beforeUpdate(id, validation.data, existingEntity);
        const updatedEntity = await this.repository.update(id, validation.data);
        await this.afterUpdate(updatedEntity);
        console.log('BaseService.update completed', { id });
        return updatedEntity;
      }
      throw new ValidationError('Validation data is undefined');
    } catch (error) {
      console.error('BaseService.update failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log('BaseService.delete called', { id });

      const idValidation = this.validator.validateId(id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid ID', idValidation.errors);
      }

      const entity = await this.repository.findById(id);
      if (!entity) {
        throw new NotFoundError(this.getResourceName());
      }

      await this.beforeDelete(id, entity);

      const deleted = await this.repository.delete(id);
      if (!deleted) {
        throw new NotFoundError(this.getResourceName());
      }

      await this.afterDelete(id, entity);

      console.log('BaseService.delete completed', { id });
    } catch (error) {
      console.error('BaseService.delete failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  protected abstract getResourceName(): string;

  protected async beforeCreate(data: Partial<T>): Promise<void> {}
  protected async afterCreate(entity: T): Promise<void> {}
  protected async beforeUpdate(id: string, data: Partial<T>, existingEntity: T): Promise<void> {}
  protected async afterUpdate(entity: T): Promise<void> {}
  protected async beforeDelete(id: string, entity: T): Promise<void> {}
  protected async afterDelete(id: string, entity: T): Promise<void> {}
}
