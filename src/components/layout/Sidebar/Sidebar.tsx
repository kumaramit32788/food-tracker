import { APP_BORDER_RADIUS, APP_BORDER_RADIUS_SM } from '@/constants/shape.ts';
import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MAIN_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  SIDEBAR_WIDTH,
  type NavItem,
} from '@/constants/navigation.ts';

interface SidebarProps {
  onNavigate?: () => void;
}

function NavItems({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <List disablePadding>
      {items.map((item) => {
        const Icon = item.icon;

        if (item.disabled || !item.path) {
          return (
            <ListItemButton key={item.id} disabled sx={{ opacity: 0.55 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } },
                }}
              />
              {item.badge && (
                <Chip label={item.badge} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
              )}
            </ListItemButton>
          );
        }

        const isActive = location.pathname === item.path;

        return (
          <ListItemButton
            key={item.id}
            component={NavLink}
            to={item.path}
            selected={isActive}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } },
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export function SidebarContent({ onNavigate }: SidebarProps) {
  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: 2.5,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ px: 1, mb: 3, alignItems: 'center' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: APP_BORDER_RADIUS_SM,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <RestaurantMenuIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            NutriTrack
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Indian nutrition tracker
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 1.5, mb: 1, letterSpacing: 0.8, fontWeight: 700 }}
      >
        MAIN
      </Typography>
      <NavItems items={MAIN_NAV_ITEMS} onNavigate={onNavigate} />

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 1.5, mb: 1, letterSpacing: 0.8, fontWeight: 700 }}
      >
        MORE
      </Typography>
      <NavItems items={SECONDARY_NAV_ITEMS} onNavigate={onNavigate} />

      <Box sx={{ flex: 1 }} />

      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: APP_BORDER_RADIUS,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
          Offline first
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your data stays on this device. 549 Indian foods ready to search.
        </Typography>
      </Box>
    </Box>
  );
}
