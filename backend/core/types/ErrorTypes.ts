/**
 * Custom Error Types (DRY)
 * Consistent error handling across the application
 */

/**
 * Base application error class
 * All custom errors should extend this
 */
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - 400 Bad Request
 */
export class ValidationError extends AppError {
  public readonly errors: ValidationFieldError[];

  constructor(message: string = 'Validation failed', errors: ValidationFieldError[] = []) {
    super(message, 400);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Individual validation field error
 */
export interface ValidationFieldError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

/**
 * Not found error - 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Unauthorized error - 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden error - 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Conflict error - 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Business logic error - 422 Unprocessable Entity
 */
export class BusinessLogicError extends AppError {
  constructor(message: string = 'Business logic violation') {
    super(message, 422);
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}

/**
 * Database error wrapper
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(message, 500);
    if (originalError) {
      this.message += `: ${originalError.message}`;
    }
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'External service error') {
    super(`${service}: ${message}`, 502);
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends AppError {
  constructor(setting: string) {
    super(`Missing or invalid configuration: ${setting}`, 500, false);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error factory functions (DRY)
 */
export class ErrorFactory {
  static validation(errors: ValidationFieldError[]): ValidationError {
    return new ValidationError('Validation failed', errors);
  }

  static notFound(resource: string): NotFoundError {
    return new NotFoundError(resource);
  }

  static unauthorized(message?: string): UnauthorizedError {
    return new UnauthorizedError(message);
  }

  static forbidden(message?: string): ForbiddenError {
    return new ForbiddenError(message);
  }

  static conflict(message?: string): ConflictError {
    return new ConflictError(message);
  }

  static businessLogic(message?: string): BusinessLogicError {
    return new BusinessLogicError(message);
  }

  static database(message?: string, originalError?: Error): DatabaseError {
    return new DatabaseError(message, originalError);
  }

  static externalService(service: string, message?: string): ExternalServiceError {
    return new ExternalServiceError(service, message);
  }

  static configuration(setting: string): ConfigurationError {
    return new ConfigurationError(setting);
  }
}

/**
 * Error response formatter (DRY)
 */
export class ErrorResponseFormatter {
  static format(error: Error): {
    success: false;
    error: string;
    details?: any;
    timestamp: string;
  } {
    const baseResponse = {
      success: false as const,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    // Add validation errors for ValidationError
    if (error instanceof ValidationError) {
      return {
        ...baseResponse,
        details: error.errors
      };
    }

    // Add status code for AppError
    if (error instanceof AppError) {
      return {
        ...baseResponse,
        details: {
          statusCode: error.statusCode,
          isOperational: error.isOperational
        }
      };
    }

    return baseResponse;
  }
}
