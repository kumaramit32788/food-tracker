import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';
import { useAppSelector } from '@/redux/hooks.ts';

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, profile } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={profile ? ROUTES.DASHBOARD : ROUTES.PROFILE} replace />;
  }

  return children;
}
