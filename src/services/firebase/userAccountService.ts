import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@/services/firebase/firebaseApp.ts';
import { firestorePaths } from '@/services/firebase/firestorePaths.ts';
import type { UserAccountMeta, UserRole } from '@/types/userAccount.types.ts';
import { isAdminRole } from '@/types/userAccount.types.ts';

function nowIso(): string {
  return new Date().toISOString();
}

export const userAccountService = {
  async getAccount(uid: string): Promise<UserAccountMeta | null> {
    const snap = await getDoc(doc(getFirestoreDb(), firestorePaths.accountMeta(uid)));
    return snap.exists() ? (snap.data() as UserAccountMeta) : null;
  },

  async getRole(uid: string): Promise<UserRole> {
    const account = await this.getAccount(uid);
    return account?.role ?? 'user';
  },

  async isAdmin(uid: string): Promise<boolean> {
    return isAdminRole(await this.getRole(uid));
  },

  /** Creates a normal user account on first sign-in. Role changes happen in Firestore only. */
  async ensureAccount(uid: string, email?: string): Promise<UserRole> {
    const ref = doc(getFirestoreDb(), firestorePaths.accountMeta(uid));
    const existing = await getDoc(ref);

    if (existing.exists()) {
      return (existing.data() as UserAccountMeta).role;
    }

    const now = nowIso();
    const meta: UserAccountMeta = {
      role: 'user',
      email,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(ref, meta);
    return 'user';
  },
};
