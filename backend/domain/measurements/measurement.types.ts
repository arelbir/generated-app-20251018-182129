/**
 * Measurement Types (TypeScript interfaces)
 * Domain-specific types for Measurements entity
 */

export interface Measurement {
  id: string;
  memberId: string;
  date: string;
  weight: number;
  height: number;
  bodyFatPercentage?: number;
  waist: number;
  hips: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementWithMember extends Measurement {
  member?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface CreateMeasurementDTO {
  memberId: string;
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

export interface UpdateMeasurementDTO {
  date?: string;
  weight?: number;
  height?: number;
  bodyFatPercentage?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
}

export interface MeasurementSearchDTO {
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
  minWeight?: number;
  maxWeight?: number;
  minBodyFat?: number;
  maxBodyFat?: number;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'weight' | 'bodyFatPercentage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
