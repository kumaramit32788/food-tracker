import { DEVICE_USER_ID } from '@/constants/db.ts';
import { deviceRepository } from '@/services/db/deviceRepository.ts';
import type { User, UserProfile } from '@/types/auth.types.ts';

function generateToken(): string {
  return `local-session-${Date.now()}`;
}

export const authService = {
  async hasDeviceAccount(): Promise<boolean> {
    return deviceRepository.hasDeviceUser();
  },

  async loginDevice(): Promise<{ user: User; token: string }> {
    const record = await deviceRepository.getDeviceUser();

    if (!record) {
      throw new Error('No account found on this device. Please set up your profile first.');
    }

    return {
      user: {
        id: DEVICE_USER_ID,
        name: record.name,
      },
      token: generateToken(),
    };
  },

  async setupAccount(profile: UserProfile): Promise<{ user: User; token: string; profile: UserProfile }> {
    const hasAccount = await deviceRepository.hasDeviceUser();

    if (hasAccount) {
      throw new Error('This device already has an account. Only one user is allowed per device.');
    }

    const user = await deviceRepository.saveDeviceUser(profile.name);
    await deviceRepository.saveProfile(profile);

    return {
      user,
      token: generateToken(),
      profile,
    };
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const saved = await deviceRepository.saveProfile(profile);
    await deviceRepository.updateDeviceUserName(profile.name);
    return saved;
  },

  async getProfile(): Promise<UserProfile | null> {
    return deviceRepository.getProfile();
  },

  async getDeviceUser(): Promise<User | null> {
    const record = await deviceRepository.getDeviceUser();

    if (!record) {
      return null;
    }

    return {
      id: DEVICE_USER_ID,
      name: record.name,
    };
  },

  logout(): void {
    // Session only — device data stays in IndexedDB.
  },
};
