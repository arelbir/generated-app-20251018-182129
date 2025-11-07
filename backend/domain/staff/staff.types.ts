/**
 * Staff Types (TypeScript interfaces)
 * Domain-specific types for Staff entity
 */

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specializationId?: string;
  hireDate: string;
  isActive: boolean;
  workingHours?: string; // JSON string: {"monday": "09:00-18:00", ...}
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffWithSpecialization extends Staff {
  specialization?: {
    id: string;
    name: string;
    displayName: string;
    description?: string;
  };
}

export interface StaffWithSchedule extends StaffWithSpecialization {
  schedule?: {
    today: any[]; // Today's sessions
    upcoming: any[]; // Next 7 days
    availability: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
  };
}

export interface CreateStaffDTO {
  fullName: string;
  email: string;
  phone?: string;
  specializationId?: string;
  hireDate: string;
  workingHours?: string;
  notes?: string;
}

export interface UpdateStaffDTO {
  fullName?: string;
  email?: string;
  phone?: string;
  specializationId?: string;
  hireDate?: string;
  isActive?: boolean;
  workingHours?: string;
  notes?: string;
}

export interface StaffSearchDTO {
  query?: string;
  filters?: {
    isActive?: boolean;
    specializationId?: string;
    hireDateFrom?: string;
    hireDateTo?: string;
  };
  page?: number;
  limit?: number;
  sortBy?: 'fullName' | 'email' | 'hireDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface StaffPerformance {
  staffId: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageRating?: number;
  totalRevenue: number;
  monthlyStats: {
    [month: string]: {
      sessions: number;
      revenue: number;
    };
  };
}

export interface WorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: '09:00-18:00',
  tuesday: '09:00-18:00',
  wednesday: '09:00-18:00',
  thursday: '09:00-18:00',
  friday: '09:00-18:00',
  saturday: '10:00-16:00',
  sunday: 'closed'
};
