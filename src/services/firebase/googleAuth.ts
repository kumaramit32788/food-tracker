import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/services/firebase/firebaseApp.ts';
import type { User } from '@/types/auth.types.ts';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? 'User',
    email: firebaseUser.email ?? undefined,
    photoURL: firebaseUser.photoURL ?? undefined,
  };
}

function shouldFallbackToRedirect(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) return false;
  const code = String((error as { code: string }).code);
  return (
    code === 'auth/internal-error' ||
    code === 'auth/popup-blocked' ||
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  );
}

export function formatFirebaseAuthError(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return error instanceof Error ? error.message : 'Google sign-in failed';
  }

  const { code, message } = error as { code: string; message: string };

  switch (code) {
    case 'auth/internal-error':
      return 'Google sign-in failed. If you use an ad blocker, allow apis.google.com and accounts.google.com for this site, then hard-refresh.';
    case 'auth/unauthorized-domain': {
      const host =
        typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
      const isVercelPreview =
        host.endsWith('.vercel.app') && !host.startsWith('food-tracker-red.');
      if (isVercelPreview) {
        return `Preview URL "${host}" is not authorized. Use your production app at food-tracker-red.vercel.app, or add this exact domain in Firebase → Authentication → Settings → Authorized domains.`;
      }
      return `Domain "${host}" is not authorized. Firebase Console → Authentication → Settings → Authorized domains → Add domain → enter "${host}".`;
    }
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase Authentication → Sign-in method.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Allow popups for this site and try again.';
    default:
      return message || 'Google sign-in failed';
  }
}

export const googleAuthService = {
  async signInWithGoogle() {
    const auth = getFirebaseAuth();

    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (shouldFallbackToRedirect(error)) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw error;
    }
  },

  getRedirectResult() {
    return getRedirectResult(getFirebaseAuth());
  },

  signOut() {
    return signOut(getFirebaseAuth());
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(getFirebaseAuth(), callback);
  },

  async getIdToken(): Promise<string | null> {
    const user = getFirebaseAuth().currentUser;
    if (!user) return null;
    return user.getIdToken();
  },

  getCurrentUid(): string | null {
    return getFirebaseAuth().currentUser?.uid ?? null;
  },
};
