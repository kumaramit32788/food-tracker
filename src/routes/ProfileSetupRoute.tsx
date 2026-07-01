import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes.ts';
import { useAppSelector } from '@/redux/hooks.ts';
import { authService } from '@/services/authService.ts';

interface ProfileSetupRouteProps {
  children: ReactNode;
}

/**
 * Profile setup is only for the single local device user.
 * - No account yet → allow setup
 * - Account exists but not signed in → login required
 * - Signed in with profile → dashboard
 */
export function ProfileSetupRoute({ children }: ProfileSetupRouteProps) {
  const { isAuthenticated, profile } = useAppSelector((state) => state.auth);
  const [hasDeviceAccount, setHasDeviceAccount] = useState<boolean | null>(null);

  useEffect(() => {
    void authService.hasDeviceAccount().then(setHasDeviceAccount);
  }, []);

  if (hasDeviceAccount === null) {
    return <LoadingScreen message="Checking device..." />;
  }

  if (hasDeviceAccount && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (isAuthenticated && profile) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
