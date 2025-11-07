/**
 * Member Repository
 * Data access layer for Member entity
 * Extends BaseRepository for common CRUD operations
 */
import { BaseRepository } from '../../core/base/BaseRepository';
import { Member, MemberWithSessions, MemberWithPackages, MemberWithMeasurements, MemberSearchDTO } from './member.types';
import { getDb, schema } from '../../db';
import { eq, like, and, gte, lte, inArray, sql, desc, asc } from 'drizzle-orm';

export class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super(getDb(), schema.members);
  }

  /**
   * Find member by email
   */
  async findByEmail(email: string): Promise<Member | null> {
    try {
      const result = await this.db
        .select()
        .from(schema.members)
        .where(eq(schema.members.email, email))
        .limit(1);

      return result[0] as Member || null;
    } catch (error) {
      throw new Error(`Failed to find member by email: ${error}`);
    }
  }

  /**
   * Find member with sessions
   */
  async findWithSessions(id: string): Promise<MemberWithSessions | null> {
    try {
      // First get the member
      const member = await this.findById(id);
      if (!member) return null;

      // Get associated sessions
      const sessions = await this.db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.memberId, id));

      return {
        ...member,
        sessions: sessions as any[] // Type assertion for sessions
      };
    } catch (error) {
      throw new Error(`Failed to find member with sessions: ${error}`);
    }
  }

  /**
   * Find member with packages
   */
  async findWithPackages(id: string): Promise<MemberWithPackages | null> {
    try {
      // First get the member
      const member = await this.findById(id);
      if (!member) return null;

      // Get associated packages (this might need to be implemented based on your schema)
      // For now, return member with empty packages array
      return {
        ...member,
        packages: []
      };
    } catch (error) {
      throw new Error(`Failed to find member with packages: ${error}`);
    }
  }

  /**
   * Find member with measurements
   */
  async findWithMeasurements(id: string): Promise<MemberWithMeasurements | null> {
    try {
      // First get the member
      const member = await this.findById(id);
      if (!member) return null;

      // Get associated measurements (this might need to be implemented based on your schema)
      // For now, return member with empty measurements array
      return {
        ...member,
        measurements: []
      };
    } catch (error) {
      throw new Error(`Failed to find member with measurements: ${error}`);
    }
  }

  /**
   * Search members by name or email
   */
  async searchByName(searchParams: MemberSearchDTO): Promise<any> {
    try {
      const { query, filters, page = 0, limit = 10, sortBy = 'fullName', sortOrder = 'asc' } = searchParams;

      let whereConditions = [];

      // Text search
      if (query) {
        whereConditions.push(
          sql`(${schema.members.fullName} ILIKE ${`%${query}%`} OR ${schema.members.email} ILIKE ${`%${query}%`})`
        );
      }

      // Filters
      if (filters) {
        if (filters.status) {
          whereConditions.push(eq(schema.members.status, filters.status));
        }
        if (filters.gender) {
          whereConditions.push(eq(schema.members.gender, filters.gender));
        }
        if (filters.isVeiled !== undefined) {
          whereConditions.push(eq(schema.members.isVeiled, filters.isVeiled));
        }
        if (filters.joinDateFrom) {
          whereConditions.push(gte(schema.members.joinDate, filters.joinDateFrom));
        }
        if (filters.joinDateTo) {
          whereConditions.push(lte(schema.members.joinDate, filters.joinDateTo));
        }
        // Health conditions filter would require a join table
        // Implementation depends on your schema structure
      }

      const whereClause = whereConditions.length > 0
        ? and(...whereConditions)
        : undefined;

      // Get total count
      const countResult = await this.db
        .select({ count: sql`count(*)` })
        .from(schema.members)
        .where(whereClause);

      const totalCount = Number(countResult[0]?.count || 0);

      // Build sort order - use Drizzle's desc/asc helpers
      const sortColumn = schema.members[sortBy];
      const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

      // Get paginated results
      const offset = page * limit;
      const items = await this.db
        .select()
        .from(schema.members)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      return {
        items: items as Member[],
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: (page + 1) * limit < totalCount,
        hasPrevPage: page > 0
      };
    } catch (error) {
      throw new Error(`Failed to search members: ${error}`);
    }
  }

  /**
   * Check if email exists (excluding specific member ID)
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.db
        .select({ count: sql`count(*)` })
        .from(schema.members)
        .where(eq(schema.members.email, email));

      if (excludeId) {
        query = query.where(sql`${schema.members.id} != ${excludeId}`);
      }

      const result = await query;
      return Number(result[0]?.count || 0) > 0;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error}`);
    }
  }

  /**
   * Get members by status
   */
  async findByStatus(status: 'active' | 'demo' | 'inactive'): Promise<Member[]> {
    try {
      const result = await this.db
        .select()
        .from(schema.members)
        .where(eq(schema.members.status, status));

      return result as Member[];
    } catch (error) {
      throw new Error(`Failed to find members by status: ${error}`);
    }
  }

  /**
   * Get member statistics
   */
  async getStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    demoMembers: number;
    inactiveMembers: number;
  }> {
    try {
      const [totalResult, activeResult, demoResult, inactiveResult] = await Promise.all([
        this.db.select({ count: sql`count(*)` }).from(schema.members),
        this.db.select({ count: sql`count(*)` }).from(schema.members).where(eq(schema.members.status, 'active')),
        this.db.select({ count: sql`count(*)` }).from(schema.members).where(eq(schema.members.status, 'demo')),
        this.db.select({ count: sql`count(*)` }).from(schema.members).where(eq(schema.members.status, 'inactive'))
      ]);

      return {
        totalMembers: Number(totalResult[0]?.count || 0),
        activeMembers: Number(activeResult[0]?.count || 0),
        demoMembers: Number(demoResult[0]?.count || 0),
        inactiveMembers: Number(inactiveResult[0]?.count || 0)
      };
    } catch (error) {
      throw new Error(`Failed to get member statistics: ${error}`);
    }
  }

  /**
   * Soft delete member (mark as inactive)
   */
  async softDelete(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .update(schema.members)
        .set({
          status: 'inactive',
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.members.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to soft delete member: ${error}`);
    }
  }

  /**
   * Bulk update member status
   */
  async bulkUpdateStatus(ids: string[], status: 'active' | 'demo' | 'inactive'): Promise<number> {
    try {
      const result = await this.db
        .update(schema.members)
        .set({
          status,
          updatedAt: new Date().toISOString()
        })
        .where(inArray(schema.members.id, ids))
        .returning();

      return result.length;
    } catch (error) {
      throw new Error(`Failed to bulk update member status: ${error}`);
    }
  }
}
