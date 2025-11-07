/**
 * Pagination Types (DRY)
 * Consistent pagination parameters across all list endpoints
 */

/**
 * Standard pagination parameters
 * Used in all list/search endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 0,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  filters: {}
};

/**
 * Pagination limits
 */
export const PAGINATION_LIMITS = {
  MIN_PAGE: 0,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10
} as const;

/**
 * Sortable fields for different entities
 * Helps prevent SQL injection in ORDER BY clauses
 */
export const SORTABLE_FIELDS = {
  members: ['fullName', 'email', 'createdAt', 'joinDate'],
  sessions: ['date', 'startTime', 'endTime', 'createdAt'],
  staff: ['fullName', 'email', 'hireDate', 'createdAt'],
  packages: ['name', 'startDate', 'endDate', 'createdAt'],
  payments: ['amount', 'paymentDate', 'createdAt'],
  measurements: ['date', 'weight', 'createdAt'],
  healthConditions: ['conditionName', 'diagnosedDate', 'createdAt']
} as const;

/**
 * Pagination helper functions (DRY)
 */
export class PaginationHelper {
  /**
   * Normalize pagination parameters with defaults
   */
  static normalize(params: Partial<PaginationParams>): Required<PaginationParams> {
    return {
      page: Math.max(0, params.page ?? DEFAULT_PAGINATION.page),
      limit: Math.min(
        PAGINATION_LIMITS.MAX_LIMIT,
        Math.max(1, params.limit ?? DEFAULT_PAGINATION.limit)
      ),
      sortBy: params.sortBy ?? DEFAULT_PAGINATION.sortBy,
      sortOrder: params.sortOrder ?? DEFAULT_PAGINATION.sortOrder,
      search: params.search ?? DEFAULT_PAGINATION.search,
      filters: params.filters ?? DEFAULT_PAGINATION.filters
    };
  }

  /**
   * Validate sortable field for entity
   */
  static isValidSortField(entity: keyof typeof SORTABLE_FIELDS, field: string): boolean {
    return (SORTABLE_FIELDS[entity] as readonly string[])?.includes(field) ?? false;
  }

  /**
   * Calculate offset for database queries
   */
  static getOffset(page: number, limit: number): number {
    return page * limit;
  }

  /**
   * Create pagination metadata
   */
  static createMeta(
    totalCount: number,
    page: number,
    limit: number
  ): {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages - 1,
      hasPrevPage: page > 0
    };
  }

  /**
   * Extract pagination from Express request
   */
  static extractFromRequest(query: any): PaginationParams {
    return {
      page: query.page ? parseInt(query.page.toString()) : undefined,
      limit: query.limit ? parseInt(query.limit.toString()) : undefined,
      sortBy: query.sortBy?.toString(),
      sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
      search: query.search?.toString(),
      filters: query.filters ? JSON.parse(query.filters.toString()) : undefined
    };
  }
}
