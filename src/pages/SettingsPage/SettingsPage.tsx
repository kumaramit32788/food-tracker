import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
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
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useThemeMode } from '@/hooks/useThemeMode.ts';
import { dataService } from '@/services/dataService.ts';
import { calculateBmi, getBmiCategory } from '@/utils/bodyMetrics.ts';

function ProfileRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const { isDark, toggle } = useThemeMode();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const bmi =
    profile?.weight && profile?.height ? calculateBmi(profile.weight, profile.height) : 0;

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
        subtitle="Manage your profile and app preferences."
      />

      <Stack spacing={3} sx={{ maxWidth: 640 }}>
        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <PersonOutlineOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Local device account
                </Typography>
              </Box>
            </Stack>

            {profile && (
              <Stack spacing={1.5}>
                <ProfileRow label="Age" value={profile.age} />
                <ProfileRow label="Gender" value={profile.gender} />
                <ProfileRow label="Height" value={`${profile.height} cm`} />
                <ProfileRow label="Weight" value={`${profile.weight} kg`} />
                {bmi > 0 && (
                  <ProfileRow
                    label="BMI (informational)"
                    value={`${bmi} — ${getBmiCategory(bmi)}`}
                  />
                )}
                <Divider sx={{ my: 0.5 }} />
                <ProfileRow label="Daily calories" value={`${profile.calorieGoal} kcal`} />
                <ProfileRow label="Protein goal" value={`${profile.proteinGoal} g`} />
                <ProfileRow label="Carbs goal" value={`${profile.carbsGoal} g`} />
                <ProfileRow label="Fat goal" value={`${profile.fatGoal} g`} />
                <ProfileRow label="Fiber goal" value={`${profile.fiberGoal ?? 25} g`} />
              </Stack>
            )}
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
                    borderRadius: 2,
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
