import { Alert, Box, Link, Stack, Typography } from '@mui/material';
import { OFFLINE_FIRST_SYNC_POLICY } from '@/services/firebase/syncUtils.ts';

export function MedicalDisclaimer() {
  return (
    <Alert severity="info">
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
  const synced = OFFLINE_FIRST_SYNC_POLICY.syncedCollections.join(', ');

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Privacy notice (India DPDP / GDPR-aligned)
      </Typography>
      <Typography variant="body2" color="text.secondary" component="div">
        <Stack spacing={1}>
          <span>
            NutriTrack is <strong>offline-first</strong>: the app reads and writes on this device
            first ({OFFLINE_FIRST_SYNC_POLICY.localStore}) so logging works without internet. When
            you sign in with Google, your profile, diary, recipes, custom foods, and favorites
            sync to {OFFLINE_FIRST_SYNC_POLICY.cloudStore} under your Google account. The built-in
            Indian food database stays on your device only.
          </span>
          <span>
            Sync is minimal: changed data is pushed when you save, and only updated bundles are
            pulled on login ({synced}). Custom foods you add are pending admin approval — visible
            only to you until approved, then shared with everyone. Your Google name, email, and
            profile photo come from Google sign-in.
          </span>
          <span>
            Data processed: name, email, profile photo, age, sex, height, weight, diet logs, custom
            foods, and recipes. Purpose: personal nutrition tracking only.
          </span>
          <span>
            You can export or delete your data anytime from Settings. Delete removes your synced
            cloud data and clears this device. Seeded foods are restored locally after delete.
            Protect your device with a passcode.
          </span>
          <span>
            Google sign-in, Firebase, and Google Fonts may contact Google servers when online. See{' '}
            <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
              Firebase Privacy
            </Link>
            .
          </span>
        </Stack>
      </Typography>
    </Box>
  );
}
