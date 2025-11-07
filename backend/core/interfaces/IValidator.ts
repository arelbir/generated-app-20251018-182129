/**
 * Generic Validator Interface (SRP + DIP)
 * Defines input validation operations
 * Part of Interface Segregation Principle (ISP)
 */
export interface IValidator<TCreate = any, TUpdate = any> {
  /**
   * Validate data for creating a new entity
   * @param data Input data to validate
   * @returns Validation result with typed data or errors
   */
  validateCreate(data: unknown): ValidationResult<TCreate>;

  /**
   * Validate data for updating an existing entity
   * @param data Input data to validate
   * @returns Validation result with typed data or errors
   */
  validateUpdate(data: unknown): ValidationResult<TUpdate>;

  /**
   * Validate entity ID parameter
   * @param id ID to validate
   * @returns Validation result with string ID or errors
   */
  validateId(id: unknown): ValidationResult<string>;
}

/**
 * Validation result structure
 * Either contains validated data or error messages
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Individual validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Common validation rules interface
 * Reusable validation logic (DRY)
 */
export interface IValidationRules {
  required(value: any, fieldName: string): ValidationError | null;
  minLength(value: string, min: number, fieldName: string): ValidationError | null;
  maxLength(value: string, max: number, fieldName: string): ValidationError | null;
  email(value: string, fieldName: string): ValidationError | null;
  phone(value: string, fieldName: string): ValidationError | null;
  uuid(value: string, fieldName: string): ValidationError | null;
  date(value: string, fieldName: string): ValidationError | null;
  number(value: any, fieldName: string): ValidationError | null;
  positiveNumber(value: number, fieldName: string): ValidationError | null;
  enum(values: any[], value: any, fieldName: string): ValidationError | null;
}
