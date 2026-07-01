import { ROUTES } from '@/constants/routes.ts';

export const publicRoutes = [ROUTES.PUBLIC] as const;

export const authRoutes = [ROUTES.LOGIN, ROUTES.PROFILE] as const;

export const protectedRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.FOODS,
  ROUTES.RECIPE_BUILDER,
  ROUTES.SETTINGS,
] as const;

export const profileRequiredRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.FOODS,
  ROUTES.RECIPE_BUILDER,
  ROUTES.SETTINGS,
] as const;
