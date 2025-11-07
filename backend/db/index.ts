import { createDb } from './db';

// Singleton database instance
let dbInstance: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!dbInstance) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    dbInstance = createDb(DATABASE_URL);
  }
  return dbInstance;
}

export { schema } from './db';
