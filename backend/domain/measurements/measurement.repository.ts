/**
 * Measurement Repository
 * Data access layer for Measurements
 */
import { BaseRepository } from '../../core/base/BaseRepository';
import {
  Measurement,
  MeasurementWithMember,
  MeasurementSearchDTO
} from './measurement.types';
import { getDb, schema } from '../../db';
import { SQL, and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';

export class MeasurementRepository extends BaseRepository<Measurement> {
  constructor() {
    super(getDb(), schema.measurements);
  }

  async findByMember(memberId: string): Promise<Measurement[]> {
    return this.db
      .select()
      .from(schema.measurements)
      .where(eq(schema.measurements.memberId, memberId))
      .orderBy(desc(schema.measurements.date));
  }

  async findLatestByMember(memberId: string): Promise<Measurement | null> {
    const result = await this.db
      .select()
      .from(schema.measurements)
      .where(eq(schema.measurements.memberId, memberId))
      .orderBy(desc(schema.measurements.date))
      .limit(1);

    return result[0] || null;
  }

  async findByMemberAndDate(memberId: string, date: string): Promise<Measurement | null> {
    const result = await this.db
      .select()
      .from(schema.measurements)
      .where(and(eq(schema.measurements.memberId, memberId), eq(schema.measurements.date, date)))
      .limit(1);

    return result[0] || null;
  }

  async findWithMember(measurementId: string): Promise<MeasurementWithMember | null> {
    const result = await this.db
      .select({
        id: schema.measurements.id,
        memberId: schema.measurements.memberId,
        date: schema.measurements.date,
        weight: schema.measurements.weight,
        height: schema.measurements.height,
        bodyFatPercentage: schema.measurements.bodyFatPercentage,
        waist: schema.measurements.waist,
        hips: schema.measurements.hips,
        chest: schema.measurements.chest,
        arms: schema.measurements.arms,
        thighs: schema.measurements.thighs,
        createdAt: schema.measurements.createdAt,
        updatedAt: schema.measurements.updatedAt,
        member: {
          id: schema.members.id,
          fullName: schema.members.fullName,
          email: schema.members.email,
          phone: schema.members.phone
        }
      })
      .from(schema.measurements)
      .innerJoin(schema.members, eq(schema.measurements.memberId, schema.members.id))
      .where(eq(schema.measurements.id, measurementId))
      .limit(1);

    return result[0] || null;
  }

  async searchMeasurements(params: MeasurementSearchDTO) {
    const {
      memberId,
      dateFrom,
      dateTo,
      minWeight,
      maxWeight,
      minBodyFat,
      maxBodyFat,
      page = 0,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc'
    } = params;

    const conditions: SQL<unknown>[] = [];

    if (memberId) {
      conditions.push(eq(schema.measurements.memberId, memberId));
    }

    if (dateFrom) {
      conditions.push(gte(schema.measurements.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(schema.measurements.date, dateTo));
    }

    if (minWeight !== undefined) {
      conditions.push(gte(schema.measurements.weight, minWeight));
    }

    if (maxWeight !== undefined) {
      conditions.push(lte(schema.measurements.weight, maxWeight));
    }

    if (minBodyFat !== undefined) {
      conditions.push(gte(schema.measurements.bodyFatPercentage, minBodyFat));
    }

    if (maxBodyFat !== undefined) {
      conditions.push(lte(schema.measurements.bodyFatPercentage, maxBodyFat));
    }

    let whereClause: SQL<unknown> | undefined;
    if (conditions.length === 1) {
      whereClause = conditions[0];
    } else if (conditions.length > 1) {
      whereClause = and(...conditions);
    }

    let countQuery = this.db
      .select({ count: sql`count(*)` })
      .from(schema.measurements);

    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }

    const countResult = await countQuery;
    const totalCount = Number(countResult[0]?.count || 0);

    const sortColumnMap = {
      date: schema.measurements.date,
      weight: schema.measurements.weight,
      bodyFatPercentage: schema.measurements.bodyFatPercentage,
      createdAt: schema.measurements.createdAt
    } as const;

    const sortColumn = sortColumnMap[sortBy];
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    let itemsQuery = this.db
      .select()
      .from(schema.measurements);

    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause);
    }

    const items = await itemsQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(page * limit);

    return {
      items,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: (page + 1) * limit < totalCount,
      hasPrevPage: page > 0
    };
  }
}
