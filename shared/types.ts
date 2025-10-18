// Generic API response wrapper
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}
export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
}
// Core Data Structures for MorFit Studio Suite
export interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  joinDate: string // ISO 8601 date string
  status: 'active' | 'demo' | 'inactive'
  gender: 'Kadın' | 'Erkek' | 'Diğer'
  isVeiled: boolean
  notes?: string
  healthConditions: string[]
  measurements: Measurement[]
  packages: Package[]
}
export interface Measurement {
  date: string // ISO 8601 date string
  weight: number // in kg
  height: number // in cm
  bodyFatPercentage?: number | null
  waist: number // in cm
  hips: number // in cm
  chest?: number // in cm
  arms?: number // in cm
  thighs?: number // in cm
}
export interface Package {
  id: string
  name: string
  deviceName: string
  startDate: string // ISO 8601 date string
  endDate: string // ISO 8601 date string
  totalSessions: number
  sessionsRemaining: number
}
export interface Session {
  id: string
  memberId: string
  subDeviceId: string // e.g., 'Vacu 1', 'Vacu 2'
  startTime: string // ISO 8601 date string
  duration: number // in minutes
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
}
export interface Device {
  id: string
  name: string // e.g., 'Vacu', 'Roll'
  quantity: number
  measurementFrequency: number | null // e.g., every 6 sessions
  status: 'active' | 'inactive'
  subDevices: SubDevice[]
  requiredSpecializationIds?: string[]
}
export interface SubDevice {
  id: string
  name: string // e.g., 'Vacu 1'
}
export interface AuditLog {
  id: string
  timestamp: string // ISO 8601
  user: string
  action: 'Seans İptal' | 'Seans Ekle' | 'Ödeme Alındı' | 'Üye Oluşturuldu'
  description: string
}
// Financial Types
export interface FinancialTransaction {
    id: string;
    date: string; // ISO 8601
    type: 'income' | 'expense';
    amount: number;
    description: string;
    relatedMember?: string;
    category?: string;
}
export interface MonthlyIncomeRow {
    id: string;
    packageDate: string; // ISO 8601
    customerName: string;
    service: string;
    salesPerson: string;
    packageFee: number;
    paymentMade: number;
    remainingBalance: number;
}
// Settings Definition Types
export interface HealthConditionDefinition {
  id: string;
  name: string;
}
export interface PackageDefinition {
  id: string;
  name: string;
  deviceName: string;
  totalSessions: number;
  price: number;
  durationDays: number;
}
export interface WorkingHour {
  day: 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}
export interface ServiceCommission {
  serviceId: string; // Corresponds to PackageDefinition id
  rate: number; // percentage
}
export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'uzman';
  status: 'active' | 'inactive';
  gender: 'Kadın' | 'Erkek' | 'Diğer';
  joinDate: string; // ISO 8601 date string
  specializationIds?: string[];
  notes?: string;
  workingHours: WorkingHour[];
  serviceCommissions: ServiceCommission[];
}
export interface SpecializationDefinition {
  id: string;
  name: string;
}