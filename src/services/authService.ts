import { getFirebaseAuth } from '@/services/firebase/firebaseApp.ts';
import {
  googleAuthService,
  mapFirebaseUser,
} from '@/services/firebase/googleAuth.ts';
import { cloudSync } from '@/services/firebase/cloudSync.ts';
import { firestoreSyncService } from '@/services/firebase/firestoreSyncService.ts';
import { userAccountService } from '@/services/firebase/userAccountService.ts';
import { deviceRepository } from '@/services/db/deviceRepository.ts';
import type { UserProfile } from '@/types/auth.types.ts';
import type { UserRole } from '@/types/userAccount.types.ts';
import type { User as FirebaseUser } from 'firebase/auth';

async function pullProfileSafely(uid: string, force = false): Promise<UserProfile | null> {
  try {
    const { profile } = await firestoreSyncService.pullUserData(uid, force);
    return profile;
  } catch (error) {
    console.warn('[auth] Cloud sync pull failed — continuing with local data', error);
    return deviceRepository.getProfile();
  }
}

async function buildSession(firebaseUser: FirebaseUser, forcePull = false) {
  const user = mapFirebaseUser(firebaseUser);
  const token = await firebaseUser.getIdToken();
  const role = await userAccountService.ensureAccount(user.id, user.email);

  firestoreSyncService.setActiveUser(user.id);
  const profile = await pullProfileSafely(user.id, forcePull);

  return { user, token, profile, role };
}

export const authService = {
  async signInWithGoogle() {
    const credential = await googleAuthService.signInWithGoogle();

    if (!credential) {
      return null;
    }

    return buildSession(credential.user, true);
  },

  async completeRedirectSignIn() {
    const result = await googleAuthService.getRedirectResult();
    if (!result?.user) return null;
    return buildSession(result.user, true);
  },

  async restoreSession() {
    const firebaseUser = getFirebaseAuth().currentUser;
    if (!firebaseUser) return null;

    return buildSession(firebaseUser, true);
  },

  async refreshRole(): Promise<UserRole | null> {
    const firebaseUser = getFirebaseAuth().currentUser;
    if (!firebaseUser) return null;
    return userAccountService.getRole(firebaseUser.uid);
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const saved = await deviceRepository.saveProfile(profile);
    await cloudSync.afterProfileSave(saved);
    return saved;
  },

  async getProfile(): Promise<UserProfile | null> {
    return deviceRepository.getProfile();
  },

  async signOut() {
    await cloudSync.flushPending();
    firestoreSyncService.setActiveUser(null);
    await googleAuthService.signOut();
  },
};
