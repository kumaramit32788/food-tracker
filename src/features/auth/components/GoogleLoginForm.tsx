import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';

export function GoogleLoginForm() {
  const { signInWithGoogle, isLoading, error, dismissError } = useAuth();

  const handleGoogleSignIn = async () => {
    dismissError();
    await signInWithGoogle();
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Welcome to NutriTrack
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in with Google to sync your profile, diary, and recipes across devices.
          NutriTrack is offline-first — data is cached locally and works without internet.
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
        startIcon={<GoogleIcon />}
        disabled={isLoading}
        onClick={() => void handleGoogleSignIn()}
      >
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
        Minimal cloud sync — only pulls changed data on login
      </Typography>
    </Stack>
  );
}
