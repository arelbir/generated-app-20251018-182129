import { users } from '../db/schema.js';

// Development için basit şifre - production'da değiştirin!
const ADMIN_PASSWORD_PLAIN = 'admin123';

export const seedUsers = [
  {
    id: 'user-admin',
    email: 'admin@morfistudio.com',
    password: ADMIN_PASSWORD_PLAIN, // Login sırasında hash'lenecek
    fullName: 'Sistem Yöneticisi',
    roleId: 'role-admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
] as const;
