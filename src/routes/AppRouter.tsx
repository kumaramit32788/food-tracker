import { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ROUTES } from '@/constants/routes.ts';
import { AuthLayout } from '@/layouts/AuthLayout.tsx';
import { DashboardLayout } from '@/layouts/DashboardLayout.tsx';
import { PublicLayout } from '@/layouts/PublicLayout.tsx';
import { DashboardPage } from '@/pages/DashboardPage';
import { FoodsPage } from '@/pages/FoodsPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PublicPage } from '@/pages/PublicPage';
import { RecipeBuilderPage } from '@/pages/RecipeBuilderPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { GuestRoute } from '@/routes/GuestRoute.tsx';
import { ProfileSetupRoute } from '@/routes/ProfileSetupRoute.tsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.tsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={ROUTES.PUBLIC} element={<PublicPage />} />
          </Route>

          <Route
            element={
              <GuestRoute>
                <AuthLayout />
              </GuestRoute>
            }
          >
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProfileSetupRoute>
                  <ProfilePage />
                </ProfileSetupRoute>
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoute requireProfile>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.FOODS} element={<FoodsPage />} />
            <Route path={ROUTES.DIARY} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.RECIPE_BUILDER} element={<RecipeBuilderPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
