import { permissions } from '../db/schema.js';

export const seedPermissions = [
  // Dashboard
  {
    id: 'perm-dashboard-view',
    pageId: 'page-dashboard',
    action: 'view',
    description: 'Dashboard görüntüleme',
  },

  // Members
  {
    id: 'perm-members-view',
    pageId: 'page-members',
    action: 'view',
    description: 'Üyeleri görüntüleme',
  },
  {
    id: 'perm-members-create',
    pageId: 'page-members',
    action: 'create',
    description: 'Yeni üye oluşturma',
  },
  {
    id: 'perm-members-edit',
    pageId: 'page-members',
    action: 'edit',
    description: 'Üye bilgilerini düzenleme',
  },
  {
    id: 'perm-members-delete',
    pageId: 'page-members',
    action: 'delete',
    description: 'Üye silme',
  },

  // Sessions
  {
    id: 'perm-sessions-view',
    pageId: 'page-sessions',
    action: 'view',
    description: 'Seansları görüntüleme',
  },
  {
    id: 'perm-sessions-create',
    pageId: 'page-sessions',
    action: 'create',
    description: 'Yeni seans oluşturma',
  },
  {
    id: 'perm-sessions-edit',
    pageId: 'page-sessions',
    action: 'edit',
    description: 'Seans bilgilerini düzenleme',
  },

  // Devices
  {
    id: 'perm-devices-view',
    pageId: 'page-devices',
    action: 'view',
    description: 'Cihazları görüntüleme',
  },
  {
    id: 'perm-devices-create',
    pageId: 'page-devices',
    action: 'create',
    description: 'Yeni cihaz oluşturma',
  },
  {
    id: 'perm-devices-edit',
    pageId: 'page-devices',
    action: 'edit',
    description: 'Cihaz bilgilerini düzenleme',
  },
  {
    id: 'perm-devices-delete',
    pageId: 'page-devices',
    action: 'delete',
    description: 'Cihaz silme',
  },

  // Settings
  {
    id: 'perm-settings-view',
    pageId: 'page-settings',
    action: 'view',
    description: 'Ayarlar sayfasına erişim',
  },

  // Staff
  {
    id: 'perm-staff-view',
    pageId: 'page-staff',
    action: 'view',
    description: 'Personelleri görüntüleme',
  },
  {
    id: 'perm-staff-create',
    pageId: 'page-staff',
    action: 'create',
    description: 'Yeni personel oluşturma',
  },
  {
    id: 'perm-staff-edit',
    pageId: 'page-staff',
    action: 'edit',
    description: 'Personel bilgilerini düzenleme',
  },
  {
    id: 'perm-staff-delete',
    pageId: 'page-staff',
    action: 'delete',
    description: 'Personel silme',
  },

  // Health Conditions
  {
    id: 'perm-health-conditions-view',
    pageId: 'page-health-conditions',
    action: 'view',
    description: 'Sağlık durumlarını görüntüleme',
  },
  {
    id: 'perm-health-conditions-create',
    pageId: 'page-health-conditions',
    action: 'create',
    description: 'Yeni sağlık durumu oluşturma',
  },
  {
    id: 'perm-health-conditions-edit',
    pageId: 'page-health-conditions',
    action: 'edit',
    description: 'Sağlık durumunu düzenleme',
  },
  {
    id: 'perm-health-conditions-delete',
    pageId: 'page-health-conditions',
    action: 'delete',
    description: 'Sağlık durumu silme',
  },

  // Packages
  {
    id: 'perm-packages-view',
    pageId: 'page-packages',
    action: 'view',
    description: 'Paketleri görüntüleme',
  },
  {
    id: 'perm-packages-create',
    pageId: 'page-packages',
    action: 'create',
    description: 'Yeni paket oluşturma',
  },
  {
    id: 'perm-packages-edit',
    pageId: 'page-packages',
    action: 'edit',
    description: 'Paket bilgilerini düzenleme',
  },
  {
    id: 'perm-packages-delete',
    pageId: 'page-packages',
    action: 'delete',
    description: 'Paket silme',
  },

  // Specializations
  {
    id: 'perm-specializations-view',
    pageId: 'page-specializations',
    action: 'view',
    description: 'Uzmanlıkları görüntüleme',
  },
  {
    id: 'perm-specializations-create',
    pageId: 'page-specializations',
    action: 'create',
    description: 'Yeni uzmanlık oluşturma',
  },
  {
    id: 'perm-specializations-edit',
    pageId: 'page-specializations',
    action: 'edit',
    description: 'Uzmanlık bilgilerini düzenleme',
  },
  {
    id: 'perm-specializations-delete',
    pageId: 'page-specializations',
    action: 'delete',
    description: 'Uzmanlık silme',
  },

  // Reports
  {
    id: 'perm-reports-view',
    pageId: 'page-reports',
    action: 'view',
    description: 'Raporları görüntüleme',
  },
] as const;
