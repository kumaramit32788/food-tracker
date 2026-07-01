import LoginIcon from '@mui/icons-material/Login';
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';

export function LocalLoginForm() {
  const { login, isLoading, error, dismissError, hasDeviceAccount } = useAuth();
  const [checkingDevice, setCheckingDevice] = useState(true);

  useEffect(() => {
    setCheckingDevice(false);
  }, [hasDeviceAccount]);

  const handleLogin = async () => {
    dismissError();
    await login();
  };

  if (checkingDevice) {
    return null;
  }

  if (!hasDeviceAccount) {
    return (
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Welcome to NutriTrack
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This device has no account yet. Set up your profile to get started.
            Only one user is allowed per device.
          </Typography>
        </Box>

        <Button component={RouterLink} to={ROUTES.PROFILE} variant="contained" size="large">
          Set Up This Device
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Continue to your local account. All data is stored on this device only.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={dismissError}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        startIcon={<LoginIcon />}
        disabled={isLoading}
        onClick={handleLogin}
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
        One device · One user · All data stored locally
      </Typography>
    </Stack>
  );
}
