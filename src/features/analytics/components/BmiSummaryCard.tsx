import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { calculateBmi, getBmiCategory } from '@/utils/bodyMetrics.ts';

interface BmiSummaryCardProps {
  weightKg?: number;
  heightCm?: number;
}

export function BmiSummaryCard({ weightKg, heightCm }: BmiSummaryCardProps) {
  const bmi =
    weightKg && heightCm && weightKg > 0 && heightCm > 0
      ? calculateBmi(weightKg, heightCm)
      : 0;
  const category = getBmiCategory(bmi);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Body metrics
        </Typography>
        {bmi > 0 ? (
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              BMI {bmi}
            </Typography>
            <Chip label={category} size="small" color="primary" variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              {weightKg} kg · {heightCm} cm
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Complete your profile to see BMI.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
