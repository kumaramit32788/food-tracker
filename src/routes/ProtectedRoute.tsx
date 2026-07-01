import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';
import { useAppSelector } from '@/redux/hooks.ts';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, profile } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requireProfile && !profile) {
    return <Navigate to={ROUTES.PROFILE} replace />;
  }

  if (!requireProfile && location.pathname === ROUTES.PROFILE && profile) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
