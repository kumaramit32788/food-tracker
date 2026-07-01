import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';

export function PublicPage() {
  return (
    <Stack
      spacing={4}
      sx={{
        minHeight: '70vh',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box>
        <Typography variant="h2" color="primary.main" gutterBottom>
          NutriTrack
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Smart nutrition tracking for Indian meals
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
          Log dal, rice, roti, and more. Track calories, macros, and build recipes tailored
          to your daily goals.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ maxWidth: 560, textAlign: 'left', borderRadius: 2 }}>
        NutriTrack provides general nutrition estimates for personal wellness only — not medical
        advice. Consult a healthcare professional before changing your diet.
      </Alert>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button component={RouterLink} to={ROUTES.LOGIN} variant="contained" size="large">
          Get Started
        </Button>
        <Button component={RouterLink} to={ROUTES.LOGIN} variant="outlined" size="large">
          Sign In
        </Button>
      </Stack>
    </Stack>
  );
}
