import type { UserProfile } from '@/types/auth.types.ts';

export interface DeviceUserRecord {
  id: string;
  name: string;
  createdAt: string;
  isSetupComplete: boolean;
}

export interface ProfileRecord extends UserProfile {
  id: string;
  updatedAt: string;
}
