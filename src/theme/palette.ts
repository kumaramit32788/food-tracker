import { DARK_THEME_COLORS, THEME_COLORS } from '@/constants/themeColors.ts';

export const lightPalette = {
  mode: 'light' as const,
  primary: THEME_COLORS.primary,
  secondary: THEME_COLORS.secondary,
  background: THEME_COLORS.background,
  text: THEME_COLORS.text,
  success: { main: THEME_COLORS.success },
  warning: { main: THEME_COLORS.warning },
  error: { main: THEME_COLORS.error },
  divider: THEME_COLORS.divider,
};

export const darkPalette = {
  mode: 'dark' as const,
  primary: {
    ...THEME_COLORS.primary,
    main: '#4CAF50',
  },
  secondary: THEME_COLORS.secondary,
  background: DARK_THEME_COLORS.background,
  text: DARK_THEME_COLORS.text,
  success: { main: '#66BB6A' },
  warning: { main: THEME_COLORS.warning },
  error: { main: '#EF5350' },
  divider: DARK_THEME_COLORS.divider,
};
