import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import {
  clearAuthError,
  refreshUserRole,
  saveUserProfile,
  signInWithGoogle,
  signOutUser,
} from '@/redux/slices/authSlice.ts';
import type { UserProfile } from '@/types/auth.types.ts';
import { isAdminRole } from '@/types/userAccount.types.ts';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, profile, role, isAuthenticated, isLoading, isAuthReady, isSigningOut, error } =
    useAppSelector((state) => state.auth);

  const signInWithGoogleHandler = useCallback(async () => {
    const result = await dispatch(signInWithGoogle());

    if (signInWithGoogle.fulfilled.match(result)) {
      if (!result.payload) return;

      if (result.payload.profile) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.PROFILE, { replace: true });
      }
    }
  }, [dispatch, navigate]);

  const saveProfile = useCallback(
    async (profileData: UserProfile, options?: { redirect?: boolean }) => {
      const result = await dispatch(saveUserProfile(profileData));

      if (saveUserProfile.fulfilled.match(result)) {
        if (options?.redirect !== false) {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
        return true;
      }

      return false;
    },
    [dispatch, navigate],
  );

  const signOut = useCallback(async () => {
    const result = await dispatch(signOutUser());
    if (signOutUser.fulfilled.match(result)) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [dispatch, navigate]);

  const dismissError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const refreshRole = useCallback(async () => {
    await dispatch(refreshUserRole());
  }, [dispatch]);

  const hasCompletedProfile = Boolean(profile);

  return {
    user,
    profile,
    role,
    isAdmin: isAdminRole(role),
    isAuthenticated,
    isAuthReady,
    isLoading,
    isSigningOut,
    error,
    hasCompletedProfile,
    signInWithGoogle: signInWithGoogleHandler,
    saveProfile,
    signOut,
    dismissError,
    refreshRole,
  };
}
