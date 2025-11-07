/**
 * Base Repository Class (OCP + LSP)
 * Generic CRUD operations for all entities
 * Extends this class for domain-specific repositories
 */
import { IRepository, PaginationParams, PaginatedResult } from '../interfaces/IRepository';
import { DatabaseError } from '../types/ErrorTypes';
import { PaginationHelper } from '../types/PaginationParams';
import { sql, desc, asc } from 'drizzle-orm';

export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(
    protected db: any, // Drizzle database instance
    protected table: any // Drizzle table schema
  ) {}

  /**
   * Find all entities with pagination
   * Generic implementation using Drizzle ORM
   */
  async findAll(params: PaginationParams): Promise<PaginatedResult<T>> {
    try {
      const normalizedParams = PaginationHelper.normalize(params);
      const { page, limit, sortBy, sortOrder } = normalizedParams;
      const offset = PaginationHelper.getOffset(page, limit);

      // Build query with sorting
      let query = this.db.select().from(this.table);

      // Apply sorting if valid
      if (this.isValidSortField(sortBy)) {
        const sortColumn = this.table[sortBy];
        const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
        query = query.orderBy(orderByClause);
      }

      // Apply pagination
      query = query.limit(limit).offset(offset);

      // Execute queries in parallel for performance
      const [items, countResult] = await Promise.all([
        query,
        this.db
          .select({ count: sql`count(*)` })
          .from(this.table)
      ]);

      const totalCount = Number(countResult[0]?.count || 0);
      const meta = PaginationHelper.createMeta(totalCount, page, limit);

      return {
        items: items as T[],
        ...meta
      };
    } catch (error) {
      throw new DatabaseError('Failed to fetch entities', error as Error);
    }
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.db
        .select()
        .from(this.table)
        .where(sql`${this.table.id} = ${id}`)
        .limit(1);

      return result[0] as T || null;
    } catch (error) {
      throw new DatabaseError('Failed to find entity', error as Error);
    }
  }

  /**
   * Create new entity
   * Generates UUID if not provided
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const entityData = {
        id: this.generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.db
        .insert(this.table)
        .values(entityData)
        .returning();

      if (!result[0]) {
        throw new DatabaseError('Failed to create entity');
      }

      return result[0] as T;
    } catch (error) {
      throw new DatabaseError('Failed to create entity', error as Error);
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      const result = await this.db
        .update(this.table)
        .set(updateData)
        .where(sql`${this.table.id} = ${id}`)
        .returning();

      if (!result[0]) {
        throw new DatabaseError('Entity not found or update failed');
      }

      return result[0] as T;
    } catch (error) {
      throw new DatabaseError('Failed to update entity', error as Error);
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(this.table)
        .where(sql`${this.table.id} = ${id}`)
        .returning();

      return result.length > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete entity', error as Error);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .select({ count: sql`count(*)` })
        .from(this.table)
        .where(sql`${this.table.id} = ${id}`)
        .limit(1);

      return Number(result[0]?.count || 0) > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check entity existence', error as Error);
    }
  }

  /**
   * Generate unique ID for entity
   * Override in subclasses if needed
   */
  protected generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate sort field for this entity
   * Override in subclasses for entity-specific validation
   */
  protected isValidSortField(field: string): boolean {
    // Default implementation - allow common fields
    const commonFields = ['id', 'createdAt', 'updatedAt'];
    return commonFields.includes(field) || this.table[field] !== undefined;
  }

  /**
   * Execute raw SQL query (for complex operations)
   * Use sparingly and with caution
   */
  protected async executeRawQuery(query: string, params: any[] = []): Promise<any> {
    try {
      return await this.db.execute(sql`${query}`, params);
    } catch (error) {
      throw new DatabaseError('Failed to execute raw query', error as Error);
    }
  }

  /**
   * Begin transaction
   * Returns transaction object for complex operations
   */
  protected async beginTransaction() {
    return await this.db.transaction();
  }
}
