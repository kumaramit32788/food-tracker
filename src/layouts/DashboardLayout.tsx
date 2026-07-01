import { Box, Drawer, Link } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppFooterDisclaimer } from '@/components/legal';
import { Navbar } from '@/components/layout/Navbar';
import { SidebarContent } from '@/components/layout/Sidebar';
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '@/constants/navigation.ts';
import { useSidebar } from '@/hooks/useSidebar.ts';

export function DashboardLayout() {
  const { isMobile, mobileOpen, closeMobile, toggleMobile } = useSidebar();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Link
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -9999,
          zIndex: 9999,
          p: 1,
          bgcolor: 'background.paper',
          '&:focus': { left: 8, top: 8 },
        }}
      >
        Skip to main content
      </Link>
      <Box
        component="nav"
        sx={{
          width: { md: SIDEBAR_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={closeMobile}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: SIDEBAR_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            <SidebarContent onNavigate={closeMobile} />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: SIDEBAR_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <SidebarContent />
          </Drawer>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar onMenuClick={toggleMobile} />

        <Box
          component="main"
          id="main-content"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, lg: 4 },
            py: 3,
            width: '100%',
            maxWidth: 1400,
            mx: 'auto',
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
          <AppFooterDisclaimer />
        </Box>
      </Box>
    </Box>
  );
}
