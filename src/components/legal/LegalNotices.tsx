import { Alert, Box, Link, Stack, Typography } from '@mui/material';

export function MedicalDisclaimer() {
  return (
    <Alert severity="info" sx={{ borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Wellness disclaimer
      </Typography>
      <Typography variant="body2">
        NutriTrack provides general nutrition estimates for personal wellness only. It is not
        medical advice, does not diagnose or treat conditions, and is not a substitute for a
        registered dietitian or physician. Consult a qualified healthcare professional before
        changing your diet, especially if you are pregnant, under 18, have an eating disorder,
        or manage a chronic condition.
      </Typography>
    </Alert>
  );
}

export function PrivacyNotice() {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Privacy notice (India DPDP / GDPR-aligned)
      </Typography>
      <Typography variant="body2" color="text.secondary" component="div">
        <Stack spacing={1}>
          <span>
            NutriTrack stores your profile, food diary, recipes, and preferences locally on this
            device using IndexedDB. We do not transmit your health data to our servers in this
            version.
          </span>
          <span>
            Data processed: name, age, sex, height, weight, diet logs, and custom foods. Purpose:
            personal nutrition tracking only.
          </span>
          <span>
            You can export or delete your data anytime from Settings. Data is not encrypted at
            rest — protect your device with a passcode.
          </span>
          <span>
            Google Fonts may load from Google servers when online. See{' '}
            <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google Privacy Policy
            </Link>
            .
          </span>
        </Stack>
      </Typography>
    </Box>
  );
}
