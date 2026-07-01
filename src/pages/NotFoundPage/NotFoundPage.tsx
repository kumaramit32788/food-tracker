import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.ts';

export function NotFoundPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h1" color="primary.main" sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h5">Page not found</Typography>
        <Typography variant="body1" color="text.secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button component={RouterLink} to={ROUTES.PUBLIC} variant="contained">
          Go Home
        </Button>
      </Box>
    </Container>
  );
}
