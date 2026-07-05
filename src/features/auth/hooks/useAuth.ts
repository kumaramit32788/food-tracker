import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';
import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import {
  clearAuthError,
  loginDevice,
  logout,
  saveUserProfile,
  setupAccount,
} from '@/redux/slices/authSlice.ts';
import { authService } from '@/services/authService.ts';
import type { UserProfile } from '@/types/auth.types.ts';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth,
  );
  const [hasDeviceAccount, setHasDeviceAccount] = useState(false);

  useEffect(() => {
    void authService.hasDeviceAccount().then(setHasDeviceAccount);
  }, [isAuthenticated]);

  const login = useCallback(async () => {
    const result = await dispatch(loginDevice());

    if (loginDevice.fulfilled.match(result)) {
      const savedProfile = result.payload.profile;

      if (savedProfile) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.PROFILE, { replace: true });
      }
    }
  }, [dispatch, navigate]);

  const createAccount = useCallback(
    async (profileData: UserProfile) => {
      const result = await dispatch(setupAccount(profileData));

      if (setupAccount.fulfilled.match(result)) {
        setHasDeviceAccount(true);
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    },
    [dispatch, navigate],
  );

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

  const signOut = useCallback(() => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  const dismissError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const hasCompletedProfile = Boolean(profile);

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    hasDeviceAccount,
    hasCompletedProfile,
    login,
    createAccount,
    saveProfile,
    signOut,
    dismissError,
  };
}
