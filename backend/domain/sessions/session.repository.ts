/**
 * Session Repository
 * Data access layer for Session entity
 * Extends BaseRepository for common CRUD operations
 */
import { BaseRepository } from '../../core/base/BaseRepository';
import { Session, SessionWithMember, SessionWithDevice, SessionSearchDTO } from './session.types';
import { getDb, schema } from '../../db';
import { SQL, eq, like, and, gte, lte, inArray, sql, desc, asc } from 'drizzle-orm';

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super(getDb(), schema.sessions);
  }

  /**
   * Find sessions by member ID
   */
  async findByMember(memberId: string): Promise<Session[]> {
    return await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.memberId, memberId))
      .orderBy(desc(schema.sessions.startTime));
  }

  /**
   * Find upcoming sessions
   */
  async findUpcoming(limit: number = 10): Promise<Session[]> {
    const now = new Date().toISOString();

    return await this.db
      .select()
      .from(schema.sessions)
      .where(and(
        gte(schema.sessions.startTime, now),
        inArray(schema.sessions.status, ['booked', 'confirmed'])
      ))
      .orderBy(asc(schema.sessions.startTime))
      .limit(limit);
  }

  /**
   * Find sessions by device
   */
  async findByDevice(subDeviceId: string): Promise<Session[]> {
    return await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.subDeviceId, subDeviceId))
      .orderBy(desc(schema.sessions.startTime));
  }

  /**
   * Find sessions in date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    return await this.db
      .select()
      .from(schema.sessions)
      .where(and(
        gte(schema.sessions.startTime, startDate),
        lte(schema.sessions.startTime, endDate)
      ))
      .orderBy(asc(schema.sessions.startTime));
  }

  /**
   * Find sessions with member details
   */
  async findWithMember(sessionId: string): Promise<SessionWithMember | null> {
    const result = await this.db
      .select({
        id: schema.sessions.id,
        memberId: schema.sessions.memberId,
        subDeviceId: schema.sessions.subDeviceId,
        startTime: schema.sessions.startTime,
        duration: schema.sessions.duration,
        status: schema.sessions.status,
        notes: schema.sessions.notes,
        createdAt: schema.sessions.createdAt,
        updatedAt: schema.sessions.updatedAt,
        member: {
          id: schema.members.id,
          fullName: schema.members.fullName,
          email: schema.members.email,
          phone: schema.members.phone
        }
      })
      .from(schema.sessions)
      .innerJoin(schema.members, eq(schema.sessions.memberId, schema.members.id))
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    return result[0] as SessionWithMember || null;
  }

  /**
   * Find sessions with device details
   */
  async findWithDevice(sessionId: string): Promise<SessionWithDevice | null> {
    const result = await this.db
      .select({
        id: schema.sessions.id,
        memberId: schema.sessions.memberId,
        subDeviceId: schema.sessions.subDeviceId,
        startTime: schema.sessions.startTime,
        duration: schema.sessions.duration,
        status: schema.sessions.status,
        notes: schema.sessions.notes,
        createdAt: schema.sessions.createdAt,
        updatedAt: schema.sessions.updatedAt,
        device: {
          id: sql`NULL`, // Placeholder - would need device table
          name: sql`NULL`,
          type: sql`NULL`
        }
      })
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    return result[0] as SessionWithDevice || null;
  }

  /**
   * Search sessions with advanced filtering
   */
  async searchSessions(searchParams: SessionSearchDTO): Promise<any> {
    const { query, filters = {}, page = 0, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = searchParams;

    const conditions: SQL<unknown>[] = [];

    if (query) {
      conditions.push(like(schema.sessions.notes, `%${query}%`));
    }

    if (filters.status && filters.status.length > 0) {
      conditions.push(inArray(schema.sessions.status, filters.status));
    }

    if (filters.memberId) {
      conditions.push(eq(schema.sessions.memberId, filters.memberId));
    }

    if (filters.subDeviceId) {
      conditions.push(eq(schema.sessions.subDeviceId, filters.subDeviceId));
    }

    if (filters.dateFrom) {
      conditions.push(gte(schema.sessions.startTime, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(schema.sessions.startTime, filters.dateTo));
    }

    let whereClause: SQL<unknown> | undefined;
    if (conditions.length === 1) {
      whereClause = conditions[0];
    } else if (conditions.length > 1) {
      whereClause = and(...conditions);
    }

    let countQuery = this.db
      .select({ count: sql`count(*)` })
      .from(schema.sessions);

    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }

    const countResult = await countQuery;
    const totalCount = Number(countResult[0]?.count || 0);

    const sortColumnMap = {
      startTime: schema.sessions.startTime,
      createdAt: schema.sessions.createdAt,
      duration: schema.sessions.duration
    } as const;

    const sortColumn = sortColumnMap[sortBy];
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const offset = page * limit;

    let itemsQuery = this.db
      .select()
      .from(schema.sessions);

    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause);
    }

    const items = await itemsQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      items: items as Session[],
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: (page + 1) * limit < totalCount,
      hasPrevPage: page > 0
    };
  }

  /**
   * Check for time conflicts
   */
  async checkTimeConflict(
    subDeviceId: string,
    startTime: string,
    duration: number,
    excludeSessionId?: string
  ): Promise<boolean> {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 1000);

    let query = this.db
      .select({ count: sql`count(*)` })
      .from(schema.sessions)
      .where(and(
        eq(schema.sessions.subDeviceId, subDeviceId),
        inArray(schema.sessions.status, ['booked', 'confirmed']),
        sql`${schema.sessions.startTime} < ${end.toISOString()}`,
        sql`${schema.sessions.startTime} + interval '1 minute' * ${schema.sessions.duration} > ${start.toISOString()}`
      ));

    if (excludeSessionId) {
      query = query.where(sql`${schema.sessions.id} != ${excludeSessionId}`);
    }

    const result = await query;
    return Number(result[0]?.count || 0) > 0;
  }
}
