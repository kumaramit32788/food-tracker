import { createTheme } from '@mui/material/styles';
import { components } from './components.ts';
import { darkPalette, lightPalette } from './palette.ts';
import { typography } from './typography.ts';

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography,
    shape: { borderRadius: 12 },
    components,
  });

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
