import { IndexedEntity } from './core-utils';
import type {
  Member,
  Package,
  Session,
  Device,
  FinancialTransaction,
  MonthlyIncomeRow,
  AuditLog,
  HealthConditionDefinition,
  PackageDefinition,
  Staff,
  SpecializationDefinition,
} from '@shared/types';
import {
  MOCK_MEMBERS,
  MOCK_SESSIONS,
  MOCK_FINANCIAL_TRANSACTIONS,
  MOCK_MONTHLY_INCOME,
  MOCK_AUDIT_LOGS,
  MOCK_DEVICES,
  MOCK_HEALTH_CONDITIONS,
  MOCK_PACKAGE_DEFINITIONS,
  MOCK_STAFF,
  MOCK_SPECIALIZATIONS,
} from '@shared/mock-data';
import type { Env } from './core-utils';
export class MemberEntity extends IndexedEntity<Member> {
  static readonly entityName = 'member';
  static readonly indexName = 'members';
  static readonly initialState: Member = {
    id: '',
    fullName: '',
    email: '',
    phone: '',
    joinDate: new Date().toISOString(),
    status: 'demo',
    gender: 'Kadın',
    isVeiled: false,
    healthConditions: [],
    measurements: [],
    packages: [],
  };
  static seedData = MOCK_MEMBERS;
  static async update(
    env: Env,
    id: string,
    patch: Partial<Member>
  ): Promise<Member | null> {
    const entity = new MemberEntity(env, id);
    if (!(await entity.exists())) {
      return null;
    }
    // For full updates, we replace the whole state
    const currentState = await entity.getState();
    const newState = { ...currentState, ...patch };
    await entity.save(newState);
    return entity.getState();
  }
}
export class PackageEntity extends IndexedEntity<Package> {
  static readonly entityName = 'package';
  static readonly indexName = 'packages';
  static readonly initialState: Package = {
    id: '',
    name: '',
    deviceName: '',
    startDate: '',
    endDate: '',
    totalSessions: 0,
    sessionsRemaining: 0,
  };
}
export class SessionEntity extends IndexedEntity<Session> {
  static readonly entityName = 'session';
  static readonly indexName = 'sessions';
  static readonly initialState: Session = {
    id: '',
    memberId: '',
    subDeviceId: '',
    startTime: '',
    duration: 30,
    status: 'booked',
  };
  static seedData = MOCK_SESSIONS;
}
export class DeviceEntity extends IndexedEntity<Device> {
  static readonly entityName = 'device';
  static readonly indexName = 'devices';
  static readonly initialState: Device = {
    id: '',
    name: '',
    quantity: 0,
    measurementFrequency: 6,
    status: 'active',
    subDevices: [],
    requiredSpecializationIds: [],
  };
  static seedData = MOCK_DEVICES;
  static async update(
    env: Env,
    id: string,
    patch: Partial<Device>
  ): Promise<Device | null> {
    const entity = new DeviceEntity(env, id);
    if (!(await entity.exists())) {
      return null;
    }
    await entity.patch(patch);
    return entity.getState();
  }
}
export class AuditLogEntity extends IndexedEntity<AuditLog> {
  static readonly entityName = 'auditLog';
  static readonly indexName = 'auditLogs';
  static readonly initialState: AuditLog = {
    id: '',
    timestamp: new Date().toISOString(),
    user: 'system',
    action: 'Seans Ekle',
    description: '',
  };
  static seedData = MOCK_AUDIT_LOGS;
}
export class FinancialTransactionEntity extends IndexedEntity<FinancialTransaction> {
  static readonly entityName = 'financialTransaction';
  static readonly indexName = 'financialTransactions';
  static readonly initialState: FinancialTransaction = {
    id: '',
    date: new Date().toISOString(),
    type: 'income',
    amount: 0,
    description: '',
  };
  static seedData = MOCK_FINANCIAL_TRANSACTIONS;
}
export class MonthlyIncomeEntity extends IndexedEntity<MonthlyIncomeRow> {
  static readonly entityName = 'monthlyIncome';
  static readonly indexName = 'monthlyIncomes';
  static readonly initialState: MonthlyIncomeRow = {
    id: '',
    packageDate: '',
    customerName: '',
    service: '',
    salesPerson: '',
    packageFee: 0,
    paymentMade: 0,
    remainingBalance: 0,
  };
  static seedData = MOCK_MONTHLY_INCOME;
}
export class HealthConditionDefinitionEntity extends IndexedEntity<HealthConditionDefinition> {
  static readonly entityName = 'healthConditionDefinition';
  static readonly indexName = 'healthConditionDefinitions';
  static readonly initialState: HealthConditionDefinition = {
    id: '',
    name: '',
  };
  static seedData = MOCK_HEALTH_CONDITIONS;
}
export class PackageDefinitionEntity extends IndexedEntity<PackageDefinition> {
  static readonly entityName = 'packageDefinition';
  static readonly indexName = 'packageDefinitions';
  static readonly initialState: PackageDefinition = {
    id: '',
    name: '',
    deviceName: '',
    totalSessions: 0,
    price: 0,
    durationDays: 0,
  };
  static seedData = MOCK_PACKAGE_DEFINITIONS;
}
export class StaffEntity extends IndexedEntity<Staff> {
  static readonly entityName = 'staff';
  static readonly indexName = 'staffs';
  static readonly initialState: Staff = {
    id: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'uzman',
    status: 'active',
    gender: 'Diğer',
    joinDate: new Date().toISOString(),
    specializationIds: [],
    workingHours: [],
    serviceCommissions: [],
  };
  static seedData = MOCK_STAFF;
}
export class SpecializationDefinitionEntity extends IndexedEntity<SpecializationDefinition> {
  static readonly entityName = 'specializationDefinition';
  static readonly indexName = 'specializationDefinitions';
  static readonly initialState: SpecializationDefinition = {
    id: '',
    name: '',
  };
  static seedData = MOCK_SPECIALIZATIONS;
}