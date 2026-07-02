import { APP_BORDER_RADIUS } from '@/constants/shape.ts';
import { createTheme } from '@mui/material/styles';
import { components } from './components.ts';
import { darkPalette, lightPalette } from './palette.ts';
import { typography } from './typography.ts';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography,
    shape: { borderRadius: APP_BORDER_RADIUS },
    components,
  });

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
