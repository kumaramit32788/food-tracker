export const THEME_COLORS = {
  primary: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#66BB6A',
    light: '#A5D6A7',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8FAF8',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#5F6368',
  },
  success: '#2E7D32',
  warning: '#F9A825',
  error: '#D32F2F',
  divider: '#E8F0E8',
} as const;

export const DARK_THEME_COLORS = {
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#B0B0B0',
  },
  divider: '#2C2C2C',
} as const;
