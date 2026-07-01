export const ROUTES = {
  PUBLIC: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  FOODS: '/foods',
  RECIPE_BUILDER: '/recipe-builder',
  DIARY: '/diary',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
