import { Box, Typography } from '@mui/material';

export function AppFooterDisclaimer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        NutriTrack provides estimated nutrition for personal wellness only — not medical advice.
        Consult a healthcare professional for medical or therapeutic nutrition needs.
      </Typography>
    </Box>
  );
}
