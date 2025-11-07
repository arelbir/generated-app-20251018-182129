/**
 * Package Types (TypeScript interfaces)
 * Domain-specific types for Package entity
 */

export interface Package {
  id: string;
  memberId: string;
  name: string;
  deviceName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  sessionsRemaining: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageWithMember extends Package {
  member: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface PackageWithUsage extends PackageWithMember {
  usage: {
    completedSessions: number;
    remainingSessions: number;
    totalSessions: number;
    usagePercentage: number;
  };
}

export interface CreatePackageDTO {
  memberId: string;
  name: string;
  deviceName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  notes?: string;
}

export interface UpdatePackageDTO {
  name?: string;
  deviceName?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  sessionsRemaining?: number;
  isActive?: boolean;
  notes?: string;
}

export interface PackageSearchDTO {
  query?: string;
  filters?: {
    memberId?: string;
    deviceName?: string;
    isActive?: boolean;
    isExpiring?: boolean; // expires within 7 days
    dateFrom?: string;
    dateTo?: string;
  };
  page?: number;
  limit?: number;
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'sessionsRemaining';
  sortOrder?: 'asc' | 'desc';
}

export interface PackageUsageDTO {
  packageId: string;
  sessionsToUse: number;
  notes?: string;
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  expiringPackages: number;
  expiredPackages: number;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
}

export interface PackageExtensionDTO {
  packageId: string;
  additionalSessions: number;
  newEndDate?: string;
  notes?: string;
}

/**
 * Package status enum
 */
export enum PackageStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * Common package types
 */
export const COMMON_PACKAGE_TYPES = [
  'Vakum Terapi - 10 Seans',
  'RF Terapi - 10 Seans',
  'Lazer Terapi - 10 Seans',
  'Vakum Terapi - 20 Seans',
  'RF Terapi - 20 Seans',
  'Lazer Terapi - 20 Seans',
  'Detoks Paketi - 15 Seans',
  'Cilt Bakım Paketi - 12 Seans'
] as const;
