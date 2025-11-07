/**
 * Package Repository
 * Data access layer for Package entity
 * Extends BaseRepository for common CRUD operations
 */
import { BaseRepository } from '../../core/base/BaseRepository';
import { Package, PackageWithMember, PackageWithUsage, PackageSearchDTO, PackageStats } from './package.types';
import { getDb, schema } from '../../db';
import { SQL, eq, like, and, gte, lte, inArray, sql, desc, asc } from 'drizzle-orm';

export class PackageRepository extends BaseRepository<Package> {
  constructor() {
    super(getDb(), schema.packages);
  }

  /**
   * Find packages by member ID
   */
  async findByMember(memberId: string): Promise<Package[]> {
    return await this.db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.memberId, memberId))
      .orderBy(desc(schema.packages.startDate));
  }

  /**
   * Find active packages by member ID
   */
  async findActiveByMember(memberId: string): Promise<Package[]> {
    return await this.db
      .select()
      .from(schema.packages)
      .where(and(
        eq(schema.packages.memberId, memberId),
        eq(schema.packages.isActive, true),
        gte(schema.packages.endDate, new Date().toISOString())
      ))
      .orderBy(asc(schema.packages.endDate));
  }

  /**
   * Find packages by device name
   */
  async findByDevice(deviceName: string): Promise<Package[]> {
    return await this.db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.deviceName, deviceName))
      .orderBy(desc(schema.packages.startDate));
  }

  /**
   * Find expiring packages (within next 7 days)
   */
  async findExpiring(limit: number = 50): Promise<Package[]> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return await this.db
      .select()
      .from(schema.packages)
      .where(and(
        eq(schema.packages.isActive, true),
        gte(schema.packages.endDate, now.toISOString()),
        lte(schema.packages.endDate, sevenDaysFromNow.toISOString())
      ))
      .orderBy(asc(schema.packages.endDate))
      .limit(limit);
  }

  /**
   * Find expired packages
   */
  async findExpired(): Promise<Package[]> {
    const now = new Date().toISOString();

    return await this.db
      .select()
      .from(schema.packages)
      .where(and(
        eq(schema.packages.isActive, true),
        lte(schema.packages.endDate, now)
      ))
      .orderBy(desc(schema.packages.endDate));
  }

  /**
   * Find packages with member details
   */
  async findWithMember(packageId: string): Promise<PackageWithMember | null> {
    const result = await this.db
      .select({
        id: schema.packages.id,
        memberId: schema.packages.memberId,
        name: schema.packages.name,
        deviceName: schema.packages.deviceName,
        startDate: schema.packages.startDate,
        endDate: schema.packages.endDate,
        totalSessions: schema.packages.totalSessions,
        sessionsRemaining: schema.packages.sessionsRemaining,
        isActive: schema.packages.isActive,
        notes: schema.packages.notes,
        createdAt: schema.packages.createdAt,
        updatedAt: schema.packages.updatedAt,
        member: {
          id: schema.members.id,
          fullName: schema.members.fullName,
          email: schema.members.email,
          phone: schema.members.phone
        }
      })
      .from(schema.packages)
      .innerJoin(schema.members, eq(schema.packages.memberId, schema.members.id))
      .where(eq(schema.packages.id, packageId))
      .limit(1);

    return result[0] as PackageWithMember || null;
  }

  /**
   * Find packages with usage statistics
   */
  async findWithUsage(packageId: string): Promise<PackageWithUsage | null> {
    const result = await this.db
      .select({
        id: schema.packages.id,
        memberId: schema.packages.memberId,
        name: schema.packages.name,
        deviceName: schema.packages.deviceName,
        startDate: schema.packages.startDate,
        endDate: schema.packages.endDate,
        totalSessions: schema.packages.totalSessions,
        sessionsRemaining: schema.packages.sessionsRemaining,
        isActive: schema.packages.isActive,
        notes: schema.packages.notes,
        createdAt: schema.packages.createdAt,
        updatedAt: schema.packages.updatedAt,
        member: {
          id: schema.members.id,
          fullName: schema.members.fullName,
          email: schema.members.email,
          phone: schema.members.phone
        }
      })
      .from(schema.packages)
      .innerJoin(schema.members, eq(schema.packages.memberId, schema.members.id))
      .where(eq(schema.packages.id, packageId))
      .limit(1);

    if (!result[0]) return null;

    const pkg = result[0] as PackageWithMember;
    const usedSessions = pkg.totalSessions - pkg.sessionsRemaining;
    const usagePercentage = pkg.totalSessions > 0 ? (usedSessions / pkg.totalSessions) * 100 : 0;

    return {
      ...pkg,
      usage: {
        completedSessions: usedSessions,
        remainingSessions: pkg.sessionsRemaining,
        totalSessions: pkg.totalSessions,
        usagePercentage: Math.round(usagePercentage * 100) / 100
      }
    };
  }

  /**
   * Search packages with advanced filtering
   */
  async searchPackages(searchParams: PackageSearchDTO): Promise<any> {
    const { query, filters = {}, page = 0, limit = 10, sortBy = 'startDate', sortOrder = 'desc' } = searchParams;

    const conditions: SQL<unknown>[] = [];

    if (query) {
      conditions.push(
        sql`(${schema.packages.name} ILIKE ${`%${query}%`} OR ${schema.packages.deviceName} ILIKE ${`%${query}%`})`
      );
    }

    if (filters.memberId) {
      conditions.push(eq(schema.packages.memberId, filters.memberId));
    }

    if (filters.deviceName) {
      conditions.push(like(schema.packages.deviceName, `%${filters.deviceName}%`));
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(schema.packages.isActive, filters.isActive));
    }

    if (filters.isExpiring) {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      conditions.push(gte(schema.packages.endDate, now.toISOString()));
      conditions.push(lte(schema.packages.endDate, sevenDaysFromNow.toISOString()));
    }

    if (filters.dateFrom) {
      conditions.push(gte(schema.packages.startDate, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(schema.packages.endDate, filters.dateTo));
    }

    let whereClause: SQL<unknown> | undefined;
    if (conditions.length === 1) {
      whereClause = conditions[0];
    } else if (conditions.length > 1) {
      whereClause = and(...conditions);
    }

    let countQuery = this.db
      .select({ count: sql`count(*)` })
      .from(schema.packages);

    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }

    const countResult = await countQuery;
    const totalCount = Number(countResult[0]?.count || 0);

    const sortColumnMap = {
      startDate: schema.packages.startDate,
      endDate: schema.packages.endDate,
      createdAt: schema.packages.createdAt,
      sessionsRemaining: schema.packages.sessionsRemaining
    } as const;

    const sortColumn = sortColumnMap[sortBy];
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const offset = page * limit;

    let itemsQuery = this.db
      .select({
        id: schema.packages.id,
        memberId: schema.packages.memberId,
        name: schema.packages.name,
        deviceName: schema.packages.deviceName,
        startDate: schema.packages.startDate,
        endDate: schema.packages.endDate,
        totalSessions: schema.packages.totalSessions,
        sessionsRemaining: schema.packages.sessionsRemaining,
        isActive: schema.packages.isActive,
        notes: schema.packages.notes,
        createdAt: schema.packages.createdAt,
        updatedAt: schema.packages.updatedAt,
        member: {
          id: schema.members.id,
          fullName: schema.members.fullName,
          email: schema.members.email
        }
      })
      .from(schema.packages)
      .leftJoin(schema.members, eq(schema.packages.memberId, schema.members.id));

    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause);
    }

    const items = await itemsQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      items: items as PackageWithMember[],
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: (page + 1) * limit < totalCount,
      hasPrevPage: page > 0
    };
  }

  /**
   * Use sessions from package
   */
  async useSessions(packageId: string, sessionsToUse: number): Promise<boolean> {
    const packageData = await this.findById(packageId);
    if (!packageData || packageData.sessionsRemaining < sessionsToUse) {
      return false;
    }

    await this.db
      .update(schema.packages)
      .set({
        sessionsRemaining: packageData.sessionsRemaining - sessionsToUse,
        updatedAt: new Date()
      })
      .where(eq(schema.packages.id, packageId));

    return true;
  }

  /**
   * Extend package with additional sessions
   */
  async extendPackage(packageId: string, additionalSessions: number, newEndDate?: string): Promise<Package | null> {
    const packageData = await this.findById(packageId);
    if (!packageData) return null;

    const updateData: any = {
      sessionsRemaining: packageData.sessionsRemaining + additionalSessions,
      totalSessions: packageData.totalSessions + additionalSessions,
      updatedAt: new Date()
    };

    if (newEndDate) {
      updateData.endDate = newEndDate;
    }

    const result = await this.db
      .update(schema.packages)
      .set(updateData)
      .where(eq(schema.packages.id, packageId))
      .returning();

    return result[0] as Package || null;
  }

  /**
   * Get package statistics
   */
  async getPackageStats(): Promise<PackageStats> {
    // This would require complex aggregation queries
    // Simplified implementation for now
    const now = new Date().toISOString();

    const [totalResult, activeResult, expiringResult, expiredResult] = await Promise.all([
      this.db.select({ count: sql`count(*)` }).from(schema.packages),
      this.db.select({ count: sql`count(*)` }).from(schema.packages)
        .where(and(eq(schema.packages.isActive, true), gte(schema.packages.endDate, now))),
      this.db.select({ count: sql`count(*)` }).from(schema.packages)
        .where(and(
          eq(schema.packages.isActive, true),
          gte(schema.packages.endDate, now),
          lte(schema.packages.endDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        )),
      this.db.select({ count: sql`count(*)` }).from(schema.packages)
        .where(and(eq(schema.packages.isActive, true), lte(schema.packages.endDate, now)))
    ]);

    return {
      totalPackages: Number(totalResult[0]?.count || 0),
      activePackages: Number(activeResult[0]?.count || 0),
      expiringPackages: Number(expiringResult[0]?.count || 0),
      expiredPackages: Number(expiredResult[0]?.count || 0),
      totalSessions: 0, // Would need aggregation
      usedSessions: 0,  // Would need aggregation
      remainingSessions: 0 // Would need aggregation
    };
  }
}
