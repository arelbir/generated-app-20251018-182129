/**
 * Member Domain Types
 * Backend-specific types for Member entity
 * Separate from frontend types for better separation of concerns
 */

// Core Member Entity (Database Schema)
export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  joinDate: string; // ISO 8601
  status: 'active' | 'demo' | 'inactive';
  gender: 'Kadın' | 'Erkek' | 'Diğer';
  isVeiled: boolean;
  notes?: string;
  healthConditions: string[]; // Array of health condition IDs
  createdAt: string;
  updatedAt: string;
}

// Create Member DTO
export interface CreateMemberDTO {
  fullName: string;
  email: string;
  phone: string;
  joinDate?: string;
  status?: 'active' | 'demo' | 'inactive';
  gender: 'Kadın' | 'Erkek' | 'Diğer';
  isVeiled?: boolean;
  notes?: string;
  healthConditions?: string[];
}

// Update Member DTO
export interface UpdateMemberDTO {
  fullName?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'demo' | 'inactive';
  gender?: 'Kadın' | 'Erkek' | 'Diğer';
  isVeiled?: boolean;
  notes?: string;
  healthConditions?: string[];
}

// Member with Relations (for detailed views)
export interface MemberWithSessions extends Member {
  sessions: Session[];
}

export interface MemberWithPackages extends Member {
  packages: Package[];
}

export interface MemberWithMeasurements extends Member {
  measurements: Measurement[];
}

export interface MemberProfile extends Member {
  sessions: Session[];
  packages: Package[];
  measurements: Measurement[];
}

// Search and Filter Types
export interface MemberSearchFilters {
  status?: 'active' | 'demo' | 'inactive';
  gender?: 'Kadın' | 'Erkek' | 'Diğer';
  isVeiled?: boolean;
  joinDateFrom?: string;
  joinDateTo?: string;
  healthConditions?: string[]; // Health condition IDs to filter by
}

export interface MemberSearchDTO {
  query?: string; // Search by name or email
  filters?: MemberSearchFilters;
  page?: number;
  limit?: number;
  sortBy?: 'fullName' | 'email' | 'joinDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Response Types
export interface MemberListResponse {
  members: Member[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Import related types (avoid circular dependencies)
export interface Session {
  id: string;
  memberId: string;
  subDeviceId: string;
  startTime: string;
  duration: number;
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface Package {
  id: string;
  name: string;
  deviceName: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  sessionsRemaining: number;
}

export interface Measurement {
  date: string;
  weight: number;
  height: number;
  bodyFatPercentage?: number;
  waist: number;
  hips: number;
  chest?: number;
  arms?: number;
  thighs?: number;
}
