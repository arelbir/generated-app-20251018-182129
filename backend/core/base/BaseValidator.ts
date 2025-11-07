/**
 * Base Validator Class (OCP + LSP)
 * Generic input validation using Zod schemas
 * Extends this class for domain-specific validators
 */
import { z } from 'zod';
import { IValidator, ValidationResult, ValidationError } from '../interfaces/IValidator';

/**
 * Base Validator - Zod wrapper implementing IValidator
 * Provides consistent validation interface across all domains
 */
export abstract class BaseValidator<TCreate = any, TUpdate = any> implements IValidator<TCreate> {
  /**
   * Create validation schema
   * Override in subclasses to define entity-specific schemas
   */
  protected abstract getCreateSchema(): z.ZodSchema<TCreate>;

  /**
   * Update validation schema
   * Must be implemented in subclasses
   */
  protected abstract getUpdateSchema(): z.ZodSchema<TUpdate>;

  /**
   * ID validation schema
   * Can be overridden for custom ID formats
   */
  protected getIdSchema(): z.ZodSchema<string> {
    return z.string().uuid('Invalid UUID format');
  }

  /**
   * Validate data for creating new entity
   * Converts Zod result to ValidationResult
   */
  validateCreate(data: unknown): ValidationResult<TCreate> {
    const result = this.getCreateSchema().safeParse(data);
    return this.convertZodResult(result);
  }

  /**
   * Validate data for updating existing entity
   * Converts Zod result to ValidationResult
   */
  validateUpdate(data: unknown): ValidationResult<TUpdate> {
    const result = this.getUpdateSchema().safeParse(data);
    return this.convertZodResult(result);
  }

  /**
   * Validate entity ID
   * Converts Zod result to ValidationResult
   */
  validateId(id: unknown): ValidationResult<string> {
    const result = this.getIdSchema().safeParse(id);
    return this.convertZodResult(result);
  }

  /**
   * Convert Zod SafeParseResult to ValidationResult
   * DRY helper method
   */
  protected convertZodResult<T>(result: any): ValidationResult<T> {
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      const errors: ValidationError[] = result.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      return {
        success: false,
        errors
      };
    }
  }
}
