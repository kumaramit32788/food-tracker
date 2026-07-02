import { APP_BORDER_RADIUS, APP_BORDER_RADIUS_SM } from '@/constants/shape.ts';
import { alpha } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        minHeight: '100vh',
        scrollBehavior: 'smooth',
      },
      '*::-webkit-scrollbar': {
        width: 8,
        height: 8,
      },
      '*::-webkit-scrollbar-thumb': {
        borderRadius: APP_BORDER_RADIUS,
        backgroundColor: 'rgba(0,0,0,0.18)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: APP_BORDER_RADIUS,
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 4px 20px rgba(46, 125, 50, 0.06)'
            : '0 4px 20px rgba(0, 0, 0, 0.35)',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 8px 28px rgba(46, 125, 50, 0.1)'
              : '0 8px 28px rgba(0, 0, 0, 0.45)',
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: APP_BORDER_RADIUS,
        padding: '10px 20px',
        textTransform: 'none',
        fontWeight: 600,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      fullWidth: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: APP_BORDER_RADIUS,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: APP_BORDER_RADIUS,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: APP_BORDER_RADIUS,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: APP_BORDER_RADIUS,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'none',
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: APP_BORDER_RADIUS,
        marginBottom: 4,
        padding: '10px 14px',
        transition: 'all 0.2s ease',
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          color: theme.palette.primary.main,
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
        },
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        borderRadius: APP_BORDER_RADIUS_SM,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: APP_BORDER_RADIUS_SM,
      },
    },
  },
};
