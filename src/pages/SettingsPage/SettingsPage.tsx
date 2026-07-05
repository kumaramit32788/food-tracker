import { appRadius } from '@/constants/shape.ts';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
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
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { PrivacyNotice } from '@/components/legal';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileForm } from '@/features/auth/components/ProfileForm.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useThemeMode } from '@/hooks/useThemeMode.ts';
import { dataService } from '@/services/dataService.ts';

export function SettingsPage() {
  const { signOut } = useAuth();
  const { isDark, toggle } = useThemeMode();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
      signOut();
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

      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Profile & goals
            </Typography>
            <ProfileForm variant="embedded" />
          </CardContent>
        </Card>

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
              >
                {isExporting ? 'Exporting…' : 'Export all data (JSON)'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverOutlinedIcon />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete all my data
              </Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              NutriTrack v0.2 · Offline-first · Data stored locally on this device
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={deleteOpen} onClose={() => !isDeleting && setDeleteOpen(false)}>
        <DialogTitle>Delete all data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes your profile, diary, recipes, and custom foods from this
            device. Seeded foods will be restored. This cannot be undone — export first if you
            want a backup.
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
