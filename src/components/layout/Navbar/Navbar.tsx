import { APP_BORDER_RADIUS } from '@/constants/shape.ts';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/common/SearchInput';
import { NAVBAR_HEIGHT } from '@/constants/navigation.ts';
import { ROUTES } from '@/constants/routes.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useThemeMode } from '@/hooks/useThemeMode.ts';

interface NavbarProps {
  onMenuClick: () => void;
}

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isDark, toggle } = useThemeMode();
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (search.trim()) {
      navigate(`${ROUTES.FOODS}?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <AppBar position="sticky" color="inherit" sx={{ height: NAVBAR_HEIGHT }}>
      <Toolbar sx={{ gap: 2, minHeight: `${NAVBAR_HEIGHT}px !important` }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ flex: 1, maxWidth: { md: 480, lg: 560 } }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search rice, dal, paneer, recipes..."
            fullWidth
          />
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggle} aria-label="Toggle theme">
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications" disabled>
              <Badge badgeContent={0} color="primary">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{ paper: { sx: { minWidth: 200, mt: 1, borderRadius: APP_BORDER_RADIUS } } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Local account
              </Typography>
            </Box>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(ROUTES.SETTINGS);
              }}
            >
              <PersonOutlineOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
              Profile & Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(ROUTES.SETTINGS);
              }}
            >
              <SettingsOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
              Preferences
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                signOut();
              }}
            >
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
              Sign out
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
