/**
 * Standard API Response Types (DRY)
 * Consistent response format across all endpoints
 */

/**
 * Standard API response structure
 * Used for all HTTP responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta | ResponseMeta;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * General response metadata
 */
export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  version?: string;
}

/**
 * Success response factory functions (DRY)
 */
export class ResponseFormatter {
  /**
   * Create success response
   */
  static success<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  /**
   * Create paginated success response
   */
  static paginated<T>(
    items: T[],
    totalCount: number,
    page: number,
    limit: number,
    meta?: ResponseMeta
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: items,
      meta: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPrevPage: page > 0,
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  /**
   * Create error response
   */
  static error(message: string, statusCode?: number): ApiResponse {
    return {
      success: false,
      error: message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Create no content response
   */
  static noContent(): ApiResponse {
    return {
      success: true,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * HTTP status codes enum for consistency
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}
