import { appRadius } from '@/constants/shape.ts';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  AppBar,
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
import { UserAvatar } from '@/components/common/UserAvatar';
import { NAVBAR_HEIGHT } from '@/constants/navigation.ts';
import { ROUTES } from '@/constants/routes.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useThemeMode } from '@/hooks/useThemeMode.ts';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { user, signOut, isSigningOut } = useAuth();
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
      <Toolbar sx={{ gap: 1.5, minHeight: `${NAVBAR_HEIGHT}px !important` }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' }, mr: 0.5 }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ width: { xs: 140, sm: 220, md: 300, lg: 360 } }}
          >
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search rice, dal, paneer..."
              fullWidth
            />
          </Box>

          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggle} aria-label="Toggle theme">
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="Account menu"
              sx={{ borderRadius: '50%' }}
            >
              <UserAvatar
                name={user?.name}
                photoURL={user?.photoURL}
                sx={{ width: 36, height: 36, fontSize: '0.9rem' }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { minWidth: 220, mt: 1, borderRadius: appRadius.lg, overflow: 'hidden' },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <UserAvatar
                  name={user?.name}
                  photoURL={user?.photoURL}
                  sx={{ width: 40, height: 40, fontSize: '0.85rem' }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user?.email ?? 'Google account'}
                  </Typography>
                </Box>
              </Stack>
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
                void signOut();
              }}
              disabled={isSigningOut}
            >
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
