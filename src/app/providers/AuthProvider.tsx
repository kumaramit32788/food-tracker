import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  formatFirebaseAuthError,
  googleAuthService,
} from '@/services/firebase/googleAuth.ts';
import { useAppDispatch } from '@/redux/hooks.ts';
import {
  clearAuthError,
  hydrateAuth,
  logout,
  setAuthError,
  setAuthReady,
} from '@/redux/slices/authSlice.ts';
import { authService } from '@/services/authService.ts';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let redirectHandled = false;

    dispatch(clearAuthError());

    async function init() {
      try {
        const session = await authService.completeRedirectSignIn();
        if (session) {
          redirectHandled = true;
          dispatch(hydrateAuth(session));
        }
      } catch (error) {
        console.warn('[auth] Redirect sign-in result failed', error);
      }

      unsubscribe = googleAuthService.onAuthStateChanged(async (firebaseUser) => {
        if (!firebaseUser) {
          dispatch(logout());
          dispatch(setAuthReady());
          return;
        }

        if (redirectHandled) {
          redirectHandled = false;
          dispatch(clearAuthError());
          dispatch(setAuthReady());
          return;
        }

        try {
          const session = await authService.restoreSession();
          if (session) {
            dispatch(hydrateAuth(session));
          }
        } catch (error) {
          console.warn('[auth] Session restore failed', error);
          dispatch(setAuthError(formatFirebaseAuthError(error)));
          dispatch(logout());
        } finally {
          dispatch(setAuthReady());
        }
      });
    }

    void init();
    return () => unsubscribe?.();
  }, [dispatch]);

  return children;
}
