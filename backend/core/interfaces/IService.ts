/**
 * Generic Service Interface (SRP + DIP)
 * Defines business logic operations for any entity type
 * Part of Interface Segregation Principle (ISP)
 */
import { PaginationParams, PaginatedResult } from './IRepository';
export interface IService<T> {
  /**
   * Retrieve all entities with pagination
   * @param params Pagination parameters
   * @returns Paginated result with business logic applied
   */
  getAll(params: PaginationParams): Promise<PaginatedResult<T>>;

  /**
   * Retrieve a single entity by ID with business validation
   * @param id Entity identifier
   * @returns Entity with business rules applied
   * @throws NotFoundError if entity doesn't exist
   */
  getById(id: string): Promise<T>;

  /**
   * Create a new entity with business validation
   * @param data Create DTO (Data Transfer Object)
   * @returns Created entity
   * @throws ValidationError if business rules violated
   */
  create(data: any): Promise<T>;

  /**
   * Update an existing entity with business validation
   * @param id Entity identifier
   * @param data Update DTO
   * @returns Updated entity
   * @throws ValidationError if business rules violated
   * @throws NotFoundError if entity doesn't exist
   */
  update(id: string, data: any): Promise<T>;

  /**
   * Delete an entity with business validation
   * @param id Entity identifier
   * @throws NotFoundError if entity doesn't exist
   */
  delete(id: string): Promise<void>;
}

/**
 * Create Data Transfer Object interface
 * Defines structure for creating new entities
 */
export interface CreateDTO {
  [key: string]: any;
}

/**
 * Update Data Transfer Object interface
 * Defines structure for updating existing entities
 */
export interface UpdateDTO {
  [key: string]: any;
}
