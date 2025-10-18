import { Hono } from 'hono'
import type { Env } from './core-utils'
import {
  MemberEntity,
  SessionEntity,
  FinancialTransactionEntity,
  MonthlyIncomeEntity,
  AuditLogEntity,
  DeviceEntity,
  HealthConditionDefinitionEntity,
  PackageDefinitionEntity,
  StaffEntity,
  SpecializationDefinitionEntity,
} from './entities'
import { ok, bad, notFound, isStr } from './core-utils'
import { Session, Device, Member, HealthConditionDefinition, PackageDefinition, Staff, SpecializationDefinition, PaginatedResponse } from '@shared/types'
import { isSameDay, parseISO } from 'date-fns'
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present on first load
  app.use('/api/*', async (c, next) => {
    await Promise.all([
      MemberEntity.ensureSeed(c.env),
      SessionEntity.ensureSeed(c.env),
      FinancialTransactionEntity.ensureSeed(c.env),
      MonthlyIncomeEntity.ensureSeed(c.env),
      AuditLogEntity.ensureSeed(c.env),
      DeviceEntity.ensureSeed(c.env),
      HealthConditionDefinitionEntity.ensureSeed(c.env),
      PackageDefinitionEntity.ensureSeed(c.env),
      StaffEntity.ensureSeed(c.env),
      SpecializationDefinitionEntity.ensureSeed(c.env),
    ])
    await next()
  })
  // --- Member Routes ---
  app.get('/api/members', async (c) => {
    const page = parseInt(c.req.query('page') || '0', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const { items: allMembers } = await MemberEntity.list(c.env);
    const totalCount = allMembers.length;
    const paginatedItems = allMembers.slice(page * limit, (page + 1) * limit);
    const response: PaginatedResponse<Member> = {
      items: paginatedItems,
      totalCount,
    };
    return ok(c, response);
  });
  app.get('/api/members/:id', async (c) => {
    const id = c.req.param('id')
    if (!isStr(id)) return bad(c, 'Invalid ID')
    const memberEntity = new MemberEntity(c.env, id)
    if (!(await memberEntity.exists())) {
      return notFound(c, 'Member not found')
    }
    const member = await memberEntity.getState()
    return ok(c, member)
  })
  app.post('/api/members', async (c) => {
    const { fullName, email, phone } = (await c.req.json()) as {
      fullName?: string
      email?: string
      phone?: string
    }
    if (!isStr(fullName) || !isStr(email) || !isStr(phone)) {
      return bad(c, 'fullName, email, and phone are required')
    }
    const newMemberData: Member = {
      ...MemberEntity.initialState,
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      joinDate: new Date().toISOString(),
    }
    const createdMember = await MemberEntity.create(c.env, newMemberData)
    return ok(c, createdMember)
  })
  app.put('/api/members/:id', async (c) => {
    const id = c.req.param('id')
    if (!isStr(id)) return bad(c, 'Invalid ID')
    const body = await c.req.json<Partial<Member>>()
    const updatedMember = await MemberEntity.update(c.env, id, body)
    if (!updatedMember) {
      return notFound(c, 'Member not found')
    }
    return ok(c, updatedMember)
  })
  // --- Session Routes ---
  app.get('/api/sessions', async (c) => {
    const memberId = c.req.query('memberId')
    const date = c.req.query('date')
    let { items } = await SessionEntity.list(c.env)
    if (memberId) {
      items = items.filter((s) => s.memberId === memberId)
    }
    if (date) {
      const targetDate = parseISO(date)
      items = items.filter(s => isSameDay(parseISO(s.startTime), targetDate))
    }
    return ok(c, items)
  })
  app.post('/api/sessions', async (c) => {
    const body = await c.req.json<Omit<Session, 'id' | 'status'>>()
    if (
      !isStr(body.memberId) ||
      !isStr(body.subDeviceId) ||
      !isStr(body.startTime)
    ) {
      return bad(c, 'Missing required session fields')
    }
    const newSession: Session = {
      ...SessionEntity.initialState,
      id: crypto.randomUUID(),
      memberId: body.memberId,
      subDeviceId: body.subDeviceId,
      startTime: body.startTime,
      duration: body.duration || 30,
      status: 'booked',
    }
    const createdSession = await SessionEntity.create(c.env, newSession)
    return ok(c, createdSession)
  })
  // --- Financial Routes ---
  app.get('/api/financials/income', async (c) => {
    const { items } = await MonthlyIncomeEntity.list(c.env)
    return ok(c, items)
  })
  app.get('/api/financials/cashbook', async (c) => {
    const { items } = await FinancialTransactionEntity.list(c.env)
    return ok(c, items)
  })
  // --- Reports Routes ---
  app.get('/api/reports/expired-packages', async (c) => {
    const { items: members } = await MemberEntity.list(c.env)
    const expiredPackages = members.flatMap((member) =>
      member.packages
        .filter(
          (pkg) =>
            new Date(pkg.endDate) < new Date() || pkg.sessionsRemaining === 0
        )
        .map((pkg) => ({ member, package: pkg }))
    )
    return ok(c, expiredPackages)
  })
  app.get('/api/reports/audit-log', async (c) => {
    const { items } = await AuditLogEntity.list(c.env)
    items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    return ok(c, items)
  })
  // --- Settings Routes ---
  app.get('/api/settings/devices', async (c) => {
    const { items } = await DeviceEntity.list(c.env)
    return ok(c, items)
  })
  app.post('/api/settings/devices', async (c) => {
    const body = await c.req.json<Omit<Device, 'id' | 'status' | 'subDevices'>>()
    if (!isStr(body.name) || typeof body.quantity !== 'number') {
        return bad(c, 'Device name and quantity are required');
    }
    const id = crypto.randomUUID();
    const subDevices = Array.from({ length: body.quantity }, (_, i) => ({
      id: crypto.randomUUID(),
      name: `${body.name} ${i + 1}`,
    }));
    const newDevice: Device = {
      ...DeviceEntity.initialState,
      ...body,
      id,
      subDevices,
      status: 'active',
    };
    const createdDevice = await DeviceEntity.create(c.env, newDevice);
    return ok(c, createdDevice);
  });
  app.put('/api/settings/devices/:id', async (c) => {
    const id = c.req.param('id')
    if (!isStr(id)) return bad(c, 'Invalid ID')
    const body = await c.req.json<Partial<Device>>()
    const updatedDevice = await DeviceEntity.update(c.env, id, body)
    if (!updatedDevice) {
      return notFound(c, 'Device not found')
    }
    return ok(c, updatedDevice)
  })
  // Health Conditions
  app.get('/api/settings/health-conditions', async (c) => {
    const { items } = await HealthConditionDefinitionEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/settings/health-conditions', async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    if (!isStr(name)) return bad(c, 'Name is required');
    const newCondition: HealthConditionDefinition = { id: crypto.randomUUID(), name };
    const created = await HealthConditionDefinitionEntity.create(c.env, newCondition);
    return ok(c, created);
  });
  app.put('/api/settings/health-conditions/:id', async (c) => {
    const id = c.req.param('id');
    const { name } = await c.req.json<{ name: string }>();
    if (!isStr(id) || !isStr(name)) return bad(c, 'ID and name are required');
    const entity = new HealthConditionDefinitionEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    await entity.patch({ name });
    return ok(c, await entity.getState());
  });
  app.delete('/api/settings/health-conditions/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await HealthConditionDefinitionEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
  // Package Definitions
  app.get('/api/settings/packages', async (c) => {
    const { items } = await PackageDefinitionEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/settings/packages', async (c) => {
    const body = await c.req.json<Omit<PackageDefinition, 'id'>>();
    const newPackage: PackageDefinition = { ...body, id: crypto.randomUUID() };
    const created = await PackageDefinitionEntity.create(c.env, newPackage);
    return ok(c, created);
  });
  app.put('/api/settings/packages/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<PackageDefinition>>();
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const entity = new PackageDefinitionEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  app.delete('/api/settings/packages/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await PackageDefinitionEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
  // Staff Routes
  app.get('/api/settings/staff', async (c) => {
    const { items } = await StaffEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/settings/staff', async (c) => {
    const body = await c.req.json<Omit<Staff, 'id'>>();
    const newStaff: Staff = { ...StaffEntity.initialState, ...body, id: crypto.randomUUID() };
    const created = await StaffEntity.create(c.env, newStaff);
    return ok(c, created);
  });
  app.put('/api/settings/staff/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<Staff>>();
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const entity = new StaffEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  app.delete('/api/settings/staff/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await StaffEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
  // Specializations
  app.get('/api/settings/specializations', async (c) => {
    const { items } = await SpecializationDefinitionEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/settings/specializations', async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    if (!isStr(name)) return bad(c, 'Name is required');
    const newSpec: SpecializationDefinition = { id: crypto.randomUUID(), name };
    const created = await SpecializationDefinitionEntity.create(c.env, newSpec);
    return ok(c, created);
  });
  app.put('/api/settings/specializations/:id', async (c) => {
    const id = c.req.param('id');
    const { name } = await c.req.json<{ name: string }>();
    if (!isStr(id) || !isStr(name)) return bad(c, 'ID and name are required');
    const entity = new SpecializationDefinitionEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    await entity.patch({ name });
    return ok(c, await entity.getState());
  });
  app.delete('/api/settings/specializations/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await SpecializationDefinitionEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
}