import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface MacroCardProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: string;
}

export function MacroCard({ label, consumed, goal, unit, color }: MacroCardProps) {
  const theme = useTheme();
  const progress = goal > 0 ? (consumed / goal) * 100 : 0;
  const displayProgress = Math.min(progress, 100);
  const isOverGoal = progress > 100;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${isOverGoal ? theme.palette.warning.main : theme.palette.divider}`,
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: isOverGoal ? theme.palette.warning.main : color,
            }}
          />
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {Math.round(consumed * 10) / 10}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            / {goal}
            {unit}
          </Typography>
        </Typography>
        {isOverGoal && (
          <Typography variant="caption" color="warning.main">
            {Math.round(progress)}% of goal
          </Typography>
        )}
        <LinearProgress
          variant="determinate"
          value={displayProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(isOverGoal ? theme.palette.warning.main : color, 0.12),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: isOverGoal ? theme.palette.warning.main : color,
            },
          }}
        />
      </Stack>
    </Box>
  );
}
