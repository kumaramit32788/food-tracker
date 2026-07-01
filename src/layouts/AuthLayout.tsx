import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <RestaurantMenuIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
              NutriTrack
            </Typography>
          </Stack>

          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Outlet />
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
