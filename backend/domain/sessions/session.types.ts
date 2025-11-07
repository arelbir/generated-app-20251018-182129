/**
 * Session Types (TypeScript interfaces)
 * Domain-specific types for Session entity
 */

export interface Session {
  id: string;
  memberId: string;
  subDeviceId: string;
  startTime: string;
  duration: number;
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithMember extends Session {
  member: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface SessionWithDevice extends Session {
  device: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CreateSessionDTO {
  memberId: string;
  subDeviceId: string;
  startTime: string;
  duration: number;
  notes?: string;
}

export interface UpdateSessionDTO {
  status?: 'booked' | 'confirmed' | 'cancelled' | 'completed';
  startTime?: string;
  duration?: number;
  notes?: string;
}

export interface SessionSearchDTO {
  query?: string;
  filters?: {
    status?: ('booked' | 'confirmed' | 'cancelled' | 'completed')[];
    memberId?: string;
    subDeviceId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'createdAt' | 'duration';
  sortOrder?: 'asc' | 'desc';
}
