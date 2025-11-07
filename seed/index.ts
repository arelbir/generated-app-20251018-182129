import { createDb } from '../backend/db/db.js';
import { roles, pages, permissions, rolePermissions, users, members, measurements, packages, sessions, staff, healthConditions, specializations } from '../db/schema.js';
import { seedRoles } from './roles.ts';
import { seedPages } from './pages.ts';
import { seedPermissions } from './permissions.ts';
import { seedRolePermissions } from './role-permissions.ts';
import { seedUsers } from './users.ts';
import { seedMembers } from './members.js';
import { seedMeasurements } from './measurements.js';
import { seedPackages } from './packages.js';
import { seedSessions } from './sessions.js';
import { seedStaff } from './staff.ts';
import { seedHealthConditions } from './health-conditions.ts';
import { seedSpecializations } from './specializations.ts';

// Database connection
const db = createDb(process.env.DATABASE_URL!);

console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

async function runSeed() {
  console.log('🌱 Starting database seeding...');
  console.log('🔗 Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

  try {
    console.log('🧪 Testing database connection...');
    const testResult = await db.select().from(members).limit(1);
    console.log('✅ Connection test successful:', testResult);

    console.log('👤 Seeding RBAC roles...');
    await db.insert(roles).values([...seedRoles]).onConflictDoNothing();

    console.log('📄 Seeding RBAC pages...');
    await db.insert(pages).values([...seedPages]).onConflictDoNothing();

    console.log('🔐 Seeding RBAC permissions...');
    await db.insert(permissions).values([...seedPermissions]).onConflictDoNothing();

    console.log('🔗 Seeding RBAC role permissions...');
    await db.insert(rolePermissions).values([...seedRolePermissions]).onConflictDoNothing();

    console.log('👨‍💼 Seeding RBAC users...');
    await db.insert(users).values([...seedUsers]).onConflictDoNothing();

    console.log('📝 Seeding members...');
    console.log('Members count:', seedMembers.length);
    await db.insert(members).values([...seedMembers]).onConflictDoNothing();

    console.log('📏 Seeding measurements...');
    console.log('Measurements count:', seedMeasurements.length);
    await db.insert(measurements).values([...seedMeasurements]).onConflictDoNothing();

    console.log('📦 Seeding packages...');
    console.log('Packages count:', seedPackages.length);
    await db.insert(packages).values([...seedPackages]).onConflictDoNothing();

    console.log('📅 Seeding sessions...');
    console.log('Sessions count:', seedSessions.length);
    await db.insert(sessions).values([...seedSessions]).onConflictDoNothing();

    console.log('🔧 Seeding specializations...');
    console.log('Specializations count:', seedSpecializations.length);
    await db.insert(specializations).values([...seedSpecializations]).onConflictDoNothing();

    console.log('👥 Seeding staff...');
    console.log('Staff count:', seedStaff.length);
    await db.insert(staff).values([...seedStaff]).onConflictDoNothing();

    console.log('🏥 Seeding health conditions...');
    console.log('Health conditions count:', seedHealthConditions.length);
    await db.insert(healthConditions).values([...seedHealthConditions]).onConflictDoNothing();

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Seeded data:');
    console.log(`   - ${seedRoles.length} roles`);
    console.log(`   - ${seedPages.length} pages`);
    console.log(`   - ${seedPermissions.length} permissions`);
    console.log(`   - ${seedRolePermissions.length} role permissions`);
    console.log(`   - ${seedUsers.length} users`);
    console.log(`   - ${seedMembers.length} members`);
    console.log(`   - ${seedMeasurements.length} measurements`);
    console.log(`   - ${seedPackages.length} packages`);
    console.log(`   - ${seedSessions.length} sessions`);
    console.log(`   - ${seedStaff.length} staff`);
    console.log(`   - ${seedHealthConditions.length} health conditions`);
    console.log(`   - ${seedSpecializations.length} specializations`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Run seeding directly
runSeed();

export { runSeed };
