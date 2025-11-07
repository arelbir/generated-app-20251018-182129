import { rolePermissions } from '../db/schema.js';

export const seedRolePermissions = [
  // Admin - All permissions
  { id: 'rp-admin-dashboard-view', roleId: 'role-admin', permissionId: 'perm-dashboard-view' },
  { id: 'rp-admin-members-view', roleId: 'role-admin', permissionId: 'perm-members-view' },
  { id: 'rp-admin-members-create', roleId: 'role-admin', permissionId: 'perm-members-create' },
  { id: 'rp-admin-members-edit', roleId: 'role-admin', permissionId: 'perm-members-edit' },
  { id: 'rp-admin-members-delete', roleId: 'role-admin', permissionId: 'perm-members-delete' },
  { id: 'rp-admin-sessions-view', roleId: 'role-admin', permissionId: 'perm-sessions-view' },
  { id: 'rp-admin-sessions-create', roleId: 'role-admin', permissionId: 'perm-sessions-create' },
  { id: 'rp-admin-sessions-edit', roleId: 'role-admin', permissionId: 'perm-sessions-edit' },
  { id: 'rp-admin-devices-view', roleId: 'role-admin', permissionId: 'perm-devices-view' },
  { id: 'rp-admin-devices-create', roleId: 'role-admin', permissionId: 'perm-devices-create' },
  { id: 'rp-admin-devices-edit', roleId: 'role-admin', permissionId: 'perm-devices-edit' },
  { id: 'rp-admin-devices-delete', roleId: 'role-admin', permissionId: 'perm-devices-delete' },
  { id: 'rp-admin-settings-view', roleId: 'role-admin', permissionId: 'perm-settings-view' },
  { id: 'rp-admin-staff-view', roleId: 'role-admin', permissionId: 'perm-staff-view' },
  { id: 'rp-admin-staff-create', roleId: 'role-admin', permissionId: 'perm-staff-create' },
  { id: 'rp-admin-staff-edit', roleId: 'role-admin', permissionId: 'perm-staff-edit' },
  { id: 'rp-admin-staff-delete', roleId: 'role-admin', permissionId: 'perm-staff-delete' },
  { id: 'rp-admin-health-view', roleId: 'role-admin', permissionId: 'perm-health-conditions-view' },
  { id: 'rp-admin-health-create', roleId: 'role-admin', permissionId: 'perm-health-conditions-create' },
  { id: 'rp-admin-health-edit', roleId: 'role-admin', permissionId: 'perm-health-conditions-edit' },
  { id: 'rp-admin-health-delete', roleId: 'role-admin', permissionId: 'perm-health-conditions-delete' },
  { id: 'rp-admin-packages-view', roleId: 'role-admin', permissionId: 'perm-packages-view' },
  { id: 'rp-admin-packages-create', roleId: 'role-admin', permissionId: 'perm-packages-create' },
  { id: 'rp-admin-packages-edit', roleId: 'role-admin', permissionId: 'perm-packages-edit' },
  { id: 'rp-admin-packages-delete', roleId: 'role-admin', permissionId: 'perm-packages-delete' },
  { id: 'rp-admin-spec-view', roleId: 'role-admin', permissionId: 'perm-specializations-view' },
  { id: 'rp-admin-spec-create', roleId: 'role-admin', permissionId: 'perm-specializations-create' },
  { id: 'rp-admin-spec-edit', roleId: 'role-admin', permissionId: 'perm-specializations-edit' },
  { id: 'rp-admin-spec-delete', roleId: 'role-admin', permissionId: 'perm-specializations-delete' },
  { id: 'rp-admin-reports-view', roleId: 'role-admin', permissionId: 'perm-reports-view' },

  // Staff - Limited permissions
  { id: 'rp-staff-dashboard-view', roleId: 'role-staff', permissionId: 'perm-dashboard-view' },
  { id: 'rp-staff-members-view', roleId: 'role-staff', permissionId: 'perm-members-view' },
  { id: 'rp-staff-members-create', roleId: 'role-staff', permissionId: 'perm-members-create' },
  { id: 'rp-staff-members-edit', roleId: 'role-staff', permissionId: 'perm-members-edit' },
  { id: 'rp-staff-sessions-view', roleId: 'role-staff', permissionId: 'perm-sessions-view' },
  { id: 'rp-staff-sessions-create', roleId: 'role-staff', permissionId: 'perm-sessions-create' },
  { id: 'rp-staff-sessions-edit', roleId: 'role-staff', permissionId: 'perm-sessions-edit' },
  { id: 'rp-staff-devices-view', roleId: 'role-staff', permissionId: 'perm-devices-view' },

  // Member - Very limited permissions
  { id: 'rp-member-dashboard-view', roleId: 'role-member', permissionId: 'perm-dashboard-view' },
  { id: 'rp-member-sessions-view', roleId: 'role-member', permissionId: 'perm-sessions-view' },
] as const;
