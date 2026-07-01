import { Box, Container, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Outlet />
      </Container>
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} NutriTrack. Built for Indian nutrition tracking.
        </Typography>
      </Box>
    </Box>
  );
}
