import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes.ts';
import { useAppSelector } from '@/redux/hooks.ts';

interface ProfileSetupRouteProps {
  children: ReactNode;
}

export function ProfileSetupRoute({ children }: ProfileSetupRouteProps) {
  const { isAuthenticated, isAuthReady, profile } = useAppSelector((state) => state.auth);

  if (!isAuthReady) {
    return <LoadingScreen message="Checking account..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (profile) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
