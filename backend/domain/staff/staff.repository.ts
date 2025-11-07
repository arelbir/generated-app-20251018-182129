/**
 * Staff Repository
 * Data access layer for Staff entity
 * Extends BaseRepository for common CRUD operations
 */
import { BaseRepository } from '../../core/base/BaseRepository';
import { Staff, StaffWithSpecialization, StaffWithSchedule, StaffSearchDTO, StaffPerformance } from './staff.types';
import { getDb, schema } from '../../db';
import { SQL, eq, like, and, gte, lte, inArray, sql, desc, asc } from 'drizzle-orm';

export class StaffRepository extends BaseRepository<Staff> {
  constructor() {
    super(getDb(), schema.staff);
  }

  /**
   * Find staff by email
   */
  async findByEmail(email: string): Promise<Staff | null> {
    const result = await this.db
      .select()
      .from(schema.staff)
      .where(eq(schema.staff.email, email))
      .limit(1);

    return result[0] as Staff || null;
  }

  /**
   * Find active staff members
   */
  async findActive(): Promise<Staff[]> {
    return await this.db
      .select()
      .from(schema.staff)
      .where(eq(schema.staff.isActive, true))
      .orderBy(asc(schema.staff.fullName));
  }

  /**
   * Find staff by specialization
   */
  async findBySpecialization(specializationId: string): Promise<Staff[]> {
    return await this.db
      .select()
      .from(schema.staff)
      .where(and(
        eq(schema.staff.specializationId, specializationId),
        eq(schema.staff.isActive, true)
      ))
      .orderBy(asc(schema.staff.fullName));
  }

  /**
   * Find staff with specialization details
   */
  async findWithSpecialization(staffId: string): Promise<StaffWithSpecialization | null> {
    const result = await this.db
      .select({
        id: schema.staff.id,
        fullName: schema.staff.fullName,
        email: schema.staff.email,
        phone: schema.staff.phone,
        specializationId: schema.staff.specializationId,
        hireDate: schema.staff.hireDate,
        isActive: schema.staff.isActive,
        workingHours: schema.staff.workingHours,
        notes: schema.staff.notes,
        createdAt: schema.staff.createdAt,
        updatedAt: schema.staff.updatedAt,
        specialization: {
          id: schema.specializations.id,
          name: schema.specializations.name,
          displayName: schema.specializations.displayName,
          description: schema.specializations.description
        }
      })
      .from(schema.staff)
      .leftJoin(schema.specializations, eq(schema.staff.specializationId, schema.specializations.id))
      .where(eq(schema.staff.id, staffId))
      .limit(1);

    return result[0] as StaffWithSpecialization || null;
  }

  /**
   * Find staff with schedule information
   */
  async findWithSchedule(staffId: string): Promise<StaffWithSchedule | null> {
    // This would include session data - simplified for now
    const staff = await this.findWithSpecialization(staffId);
    if (!staff) return null;

    // Mock schedule data - in real implementation, this would query sessions
    const schedule = {
      today: [], // Would query today's sessions
      upcoming: [], // Would query upcoming sessions
      availability: staff.workingHours ? JSON.parse(staff.workingHours) : null
    };

    return {
      ...staff,
      schedule
    };
  }

  /**
   * Search staff with advanced filtering
   */
  async searchStaff(searchParams: StaffSearchDTO): Promise<any> {
    const { query, filters = {}, page = 0, limit = 10, sortBy = 'fullName', sortOrder = 'asc' } = searchParams;

    const conditions: SQL<unknown>[] = [];

    if (query) {
      conditions.push(
        sql`(${schema.staff.fullName} ILIKE ${`%${query}%`} OR ${schema.staff.email} ILIKE ${`%${query}%`})`
      );
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(schema.staff.isActive, filters.isActive));
    }

    if (filters.specializationId) {
      conditions.push(eq(schema.staff.specializationId, filters.specializationId));
    }

    if (filters.hireDateFrom) {
      conditions.push(gte(schema.staff.hireDate, filters.hireDateFrom));
    }

    if (filters.hireDateTo) {
      conditions.push(lte(schema.staff.hireDate, filters.hireDateTo));
    }

    let whereClause: SQL<unknown> | undefined;
    if (conditions.length === 1) {
      whereClause = conditions[0];
    } else if (conditions.length > 1) {
      whereClause = and(...conditions);
    }

    let countQuery = this.db
      .select({ count: sql`count(*)` })
      .from(schema.staff);

    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }

    const countResult = await countQuery;
    const totalCount = Number(countResult[0]?.count || 0);

    const sortColumnMap = {
      fullName: schema.staff.fullName,
      email: schema.staff.email,
      hireDate: schema.staff.hireDate,
      createdAt: schema.staff.createdAt
    } as const;

    const sortColumn = sortColumnMap[sortBy];
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const offset = page * limit;

    let itemsQuery = this.db
      .select({
        id: schema.staff.id,
        fullName: schema.staff.fullName,
        email: schema.staff.email,
        phone: schema.staff.phone,
        specializationId: schema.staff.specializationId,
        hireDate: schema.staff.hireDate,
        isActive: schema.staff.isActive,
        workingHours: schema.staff.workingHours,
        notes: schema.staff.notes,
        createdAt: schema.staff.createdAt,
        updatedAt: schema.staff.updatedAt,
        specialization: {
          id: schema.specializations.id,
          name: schema.specializations.name,
          displayName: schema.specializations.displayName
        }
      })
      .from(schema.staff)
      .leftJoin(schema.specializations, eq(schema.staff.specializationId, schema.specializations.id));

    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause);
    }

    const items = await itemsQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      items: items as StaffWithSpecialization[],
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: (page + 1) * limit < totalCount,
      hasPrevPage: page > 0
    };
  }

  /**
   * Get staff performance statistics
   */
  async getStaffPerformance(staffId: string): Promise<StaffPerformance> {
    // This would require complex queries with sessions and payments
    // Simplified implementation for now

    const staff = await this.findById(staffId);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Mock performance data - in real implementation, this would aggregate from sessions
    const performance: StaffPerformance = {
      staffId,
      totalSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalRevenue: 0,
      monthlyStats: {}
    };

    return performance;
  }

  /**
   * Check if email exists (excluding specific staff ID)
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .select({ count: sql`count(*)` })
      .from(schema.staff)
      .where(eq(schema.staff.email, email));

    if (excludeId) {
      query = query.where(sql`${schema.staff.id} != ${excludeId}`);
    }

    const result = await query;
    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Get available staff for a specific time slot
   */
  async getAvailableStaff(dateTime: string, duration: number): Promise<Staff[]> {
    // This would check working hours and existing sessions
    // Simplified implementation for now
    return await this.findActive();
  }
}
