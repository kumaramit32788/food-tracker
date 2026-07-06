import { appRadius } from '@/constants/shape.ts';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { PrivacyNotice } from '@/components/legal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileForm } from '@/features/auth/components/ProfileForm.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { FoodModerationPanel } from '@/features/foods/components/FoodModerationPanel.tsx';
import { useThemeMode } from '@/hooks/useThemeMode.ts';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { dataService } from '@/services/dataService.ts';

export function SettingsPage() {
  const { user, isAdmin, refreshRole, signOut, isSigningOut, error: authError, dismissError } =
    useAuth();
  const { isDark, toggle } = useThemeMode();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void refreshRole();
  }, [refreshRole]);

  const handleSignOut = async () => {
    setActionError(null);
    await signOut();
  };

  const handleExport = async () => {
    setActionError(null);
    setIsExporting(true);
    try {
      await dataService.downloadExport();
    } catch {
      setActionError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAll = async () => {
    setActionError(null);
    setIsDeleting(true);
    try {
      await dataService.deleteAllUserData();
      setDeleteOpen(false);
      await signOut();
    } catch {
      setActionError('Could not delete data. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Edit your profile, goals, and app preferences."
      />

      <Grid container spacing={3} sx={{ width: '100%' }}>
        {(actionError || authError) && (
          <Grid size={12}>
            {actionError && (
              <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: authError ? 2 : 0 }}>
                {actionError}
              </Alert>
            )}
            {authError && (
              <Alert severity="error" onClose={dismissError}>
                {authError}
              </Alert>
            )}
          </Grid>
        )}

        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <UserAvatar
                      name={user?.name}
                      photoURL={user?.photoURL}
                      sx={{ width: 48, height: 48, fontSize: '1rem' }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user?.email ?? 'Google account'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    startIcon={<LogoutOutlinedIcon />}
                    onClick={() => void handleSignOut()}
                    disabled={isSigningOut || isDeleting}
                  >
                    {isSigningOut ? 'Signing out…' : 'Sign out'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Profile & goals
                </Typography>
                <ProfileForm variant="embedded" />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {isAdmin && user?.id && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: appRadius.sm,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <GavelOutlinedIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Food moderation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Approve user-submitted foods for the community
                        </Typography>
                      </Box>
                    </Stack>
                    <FoodModerationPanel adminUid={user.id} />
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: appRadius.sm,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'action.hover',
                      }}
                    >
                      {isDark ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Dark mode
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Easier on the eyes at night
                      </Typography>
                    </Box>
                  </Stack>
                  <Switch checked={isDark} onChange={toggle} />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                  Data & privacy
                </Typography>
                <PrivacyNotice />
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={() => void handleExport()}
                    disabled={isExporting}
                    fullWidth
                  >
                    {isExporting ? 'Exporting…' : 'Export all data (JSON)'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverOutlinedIcon />}
                    onClick={() => setDeleteOpen(true)}
                    fullWidth
                  >
                    Delete all my data
                  </Button>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  NutriTrack v0.2 · Google sign-in · Synced to Firebase · Cached locally for offline use
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={deleteOpen} onClose={() => !isDeleting && setDeleteOpen(false)}>
        <DialogTitle>Delete all data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes your profile, diary, recipes, and custom foods from this
            device and your synced Firebase account. Seeded foods will be restored locally. This
            cannot be undone — export first if you want a backup.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="error" onClick={() => void handleDeleteAll()} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete everything'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
