import {
  DEVICE_RECORD_ID,
  DEVICE_USER_ID,
  PROFILE_RECORD_ID,
} from '@/constants/db.ts';
import { db } from '@/services/db/dexieDb.ts';
import type { DeviceUserRecord, ProfileRecord } from '@/types/db.types.ts';
import type { User, UserProfile } from '@/types/auth.types.ts';

export const deviceRepository = {
  async hasDeviceUser(): Promise<boolean> {
    const user = await db.device.get(DEVICE_RECORD_ID);
    return Boolean(user?.isSetupComplete);
  },

  async getDeviceUser(): Promise<DeviceUserRecord | null> {
    return (await db.device.get(DEVICE_RECORD_ID)) ?? null;
  },

  async saveDeviceUser(name: string): Promise<User> {
    const record: DeviceUserRecord = {
      id: DEVICE_RECORD_ID,
      name,
      createdAt: new Date().toISOString(),
      isSetupComplete: true,
    };

    await db.device.put(record);

    return {
      id: DEVICE_USER_ID,
      name,
    };
  },

  async updateDeviceUserName(name: string): Promise<void> {
    const record = await db.device.get(DEVICE_RECORD_ID);
    if (!record) {
      return;
    }

    await db.device.put({ ...record, name });
  },

  async getProfile(): Promise<UserProfile | null> {
    const record = await db.profile.get(PROFILE_RECORD_ID);

    if (!record) {
      return null;
    }

    const { id: _id, updatedAt: _updatedAt, ...profile } = record;
    return profile;
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const record: ProfileRecord = {
      id: PROFILE_RECORD_ID,
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    await db.profile.put(record);
    return profile;
  },
};
