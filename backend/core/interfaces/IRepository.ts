/**
 * Generic Repository Interface (SRP + DIP)
 * Defines data access operations for any entity type
 * Part of Interface Segregation Principle (ISP)
 */
export interface IRepository<T> {
  /**
   * Retrieve all entities with pagination
   * @param params Pagination parameters
   * @returns Paginated result containing items and metadata
   */
  findAll(params: PaginationParams): Promise<PaginatedResult<T>>;

  /**
   * Retrieve a single entity by ID
   * @param id Entity identifier
   * @returns Entity or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Create a new entity
   * @param data Partial entity data (ID will be generated)
   * @returns Created entity with ID
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update an existing entity
   * @param id Entity identifier
   * @param data Partial entity data to update
   * @returns Updated entity
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete an entity by ID
   * @param id Entity identifier
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if entity exists by ID
   * @param id Entity identifier
   * @returns True if exists
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Pagination parameters for list operations
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
