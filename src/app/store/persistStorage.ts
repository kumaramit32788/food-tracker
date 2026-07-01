import { db } from '@/services/db/dexieDb.ts';
import type { WebStorage } from 'redux-persist/lib/types';

export const persistStorage: WebStorage = {
  async getItem(key) {
    const record = await db.settings.get(key);
    return record?.value ?? null;
  },
  async setItem(key, value) {
    await db.settings.put({ id: key, value });
  },
  async removeItem(key) {
    await db.settings.delete(key);
  },
};
