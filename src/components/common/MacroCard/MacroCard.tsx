import {
  APP_BORDER_RADIUS_SM,
  APP_BORDER_RADIUS_XS,
} from '@/constants/shape.ts';
import { Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
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
  const accentColor = isOverGoal ? theme.palette.warning.main : color;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: isOverGoal ? theme.palette.warning.main : 'divider',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <Chip
              size="small"
              label={`${Math.round(progress)}%`}
              sx={{
                height: 22,
                fontWeight: 700,
                fontSize: 11,
                borderRadius: APP_BORDER_RADIUS_SM,
                bgcolor: alpha(accentColor, 0.12),
                color: isOverGoal ? 'warning.dark' : accentColor,
                border: `1px solid ${alpha(accentColor, 0.25)}`,
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
          <LinearProgress
            variant="determinate"
            value={displayProgress}
            sx={{
              height: 8,
              borderRadius: APP_BORDER_RADIUS_XS,
              bgcolor: alpha(accentColor, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: APP_BORDER_RADIUS_XS,
                bgcolor: accentColor,
              },
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
