import { useCallback, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export function useSidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  return {
    isMobile,
    mobileOpen,
    openMobile,
    closeMobile,
    toggleMobile,
  };
}
