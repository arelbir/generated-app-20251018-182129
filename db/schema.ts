import { pgTable, text, integer, boolean, real, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Members table
export const members = pgTable('members', {
  id: text('id').primaryKey(),
  fullName: text('fullName').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  joinDate: text('joinDate').notNull(), // ISO 8601 date string
  status: text('status').notNull(), // 'active' | 'demo' | 'inactive'
  gender: text('gender').notNull(), // 'Kadın' | 'Erkek' | 'Diğer'
  isVeiled: boolean('isVeiled').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Measurements table
export const measurements = pgTable('measurements', {
  id: text('id').primaryKey(),
  memberId: text('memberId').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // ISO 8601 date string
  weight: real('weight').notNull(), // in kg
  height: integer('height').notNull(), // in cm
  bodyFatPercentage: real('bodyFatPercentage'), // percentage
  waist: integer('waist').notNull(), // in cm
  hips: integer('hips').notNull(), // in cm
  chest: integer('chest'), // in cm
  arms: integer('arms'), // in cm
  thighs: integer('thighs'), // in cm
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Packages table - üye paketleri
export const packages = pgTable('packages', {
  id: text('id').primaryKey(),
  memberId: text('memberId').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  deviceName: text('deviceName').notNull(),
  startDate: text('startDate').notNull(), // ISO 8601 date string
  endDate: text('endDate').notNull(), // ISO 8601 date string
  totalSessions: integer('totalSessions').notNull(),
  sessionsRemaining: integer('sessionsRemaining').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  memberId: text('memberId').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  subDeviceId: text('subDeviceId').notNull(), // e.g., 'Vacu 1', 'Vacu 2'
  startTime: text('startTime').notNull(), // ISO 8601 date string
  duration: integer('duration').notNull(), // in minutes
  status: text('status').notNull(), // 'booked' | 'confirmed' | 'cancelled' | 'completed'
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Staff table - çalışan bilgileri
export const staff = pgTable('staff', {
  id: text('id').primaryKey(),
  fullName: text('fullName').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  specializationId: text('specializationId').references(() => specializations.id),
  hireDate: text('hireDate').notNull(), // ISO 8601 date string
  isActive: boolean('isActive').notNull().default(true),
  workingHours: text('workingHours'), // JSON string: {"monday": "09:00-18:00", ...}
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Health conditions table - üye sağlık durumları
export const healthConditions = pgTable('health_conditions', {
  id: text('id').primaryKey(),
  memberId: text('memberId').references(() => members.id, { onDelete: 'cascade' }).notNull(),
  conditionName: text('conditionName').notNull(), // 'Alerji', 'Hamilelik', 'Kronik Hastalık'
  severity: text('severity').notNull(), // 'low', 'medium', 'high', 'critical'
  description: text('description'),
  diagnosedDate: text('diagnosedDate'), // ISO 8601 date string
  isActive: boolean('isActive').notNull().default(true),
  notes: text('notes'),
});

// Specializations table - hizmet uzmanlıkları
export const specializations = pgTable('specializations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'Vacuum Therapy', 'RF Therapy', 'Laser'
  displayName: text('displayName').notNull(), // 'Vakum Terapi', 'RF Terapi'
  description: text('description'),
  deviceCount: integer('deviceCount').notNull().default(1),
  sessionDuration: integer('sessionDuration').notNull().default(60), // in minutes
  pricePerSession: real('pricePerSession'), // in currency
  isActive: boolean('isActive').notNull().default(true),
});

// RBAC Tables
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'admin', 'staff', 'member'
  displayName: text('displayName').notNull(), // 'Yönetici', 'Personel', 'Üye'
  description: text('description'),
  isActive: boolean('isActive').notNull().default(true),
});

export const pages = pgTable('pages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'dashboard', 'members', 'sessions'
  path: text('path').notNull(), // '/dashboard', '/members'
  displayName: text('displayName').notNull(), // 'Dashboard', 'Üyeler'
  icon: text('icon'), // 'LayoutDashboard', 'Users'
  parentId: text('parentId'), // For submenus
  sortOrder: integer('sortOrder').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
});

export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  pageId: text('pageId').references(() => pages.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(), // 'view', 'create', 'edit', 'delete'
  description: text('description'),
});

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('roleId').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permissionId: text('permissionId').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('fullName').notNull(),
  roleId: text('roleId').references(() => roles.id).notNull(),
  isActive: boolean('isActive').notNull().default(true),
  lastLogin: text('lastLogin'),
  createdAt: text('createdAt').notNull(),
});

// Relations
export const membersRelations = relations(members, ({ many }) => ({
  measurements: many(measurements),
  packages: many(packages),
  sessions: many(sessions),
  healthConditions: many(healthConditions),
}));

export const measurementsRelations = relations(measurements, ({ one }) => ({
  member: one(members, {
    fields: [measurements.memberId],
    references: [members.id],
  }),
}));

export const packagesRelations = relations(packages, ({ one }) => ({
  member: one(members, {
    fields: [packages.memberId],
    references: [members.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  member: one(members, {
    fields: [sessions.memberId],
    references: [members.id],
  }),
}));

// Settings Relations
export const staffRelations = relations(staff, ({ one }) => ({
  specialization: one(specializations, {
    fields: [staff.specializationId],
    references: [specializations.id],
  }),
}));

export const healthConditionsRelations = relations(healthConditions, ({ one }) => ({
  member: one(members, {
    fields: [healthConditions.memberId],
    references: [members.id],
  }),
}));

export const specializationsRelations = relations(specializations, ({ many }) => ({
  staff: many(staff),
}));

// RBAC Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}));

export const pagesRelations = relations(pages, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  page: one(pages, {
    fields: [permissions.pageId],
    references: [pages.id],
  }),
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));
