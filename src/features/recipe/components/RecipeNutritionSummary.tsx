import { APP_BORDER_RADIUS_SM } from '@/constants/shape.ts';
import { Box, Grid, Stack, Typography } from '@mui/material';
import type { RecipeNutritionResult } from '@/utils/calculateRecipeNutrition.ts';
import { formatCalories, formatGrams } from '@/utils/formatNutrition.ts';

interface RecipeNutritionSummaryProps {
  nutrition: RecipeNutritionResult | null | undefined;
  servings: number;
  isLoading?: boolean;
}

function MacroTile({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: APP_BORDER_RADIUS_SM,
        bgcolor: 'action.hover',
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function RecipeNutritionSummary({
  nutrition,
  servings,
  isLoading = false,
}: RecipeNutritionSummaryProps) {
  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Calculating nutrition...
      </Typography>
    );
  }

  if (!nutrition) {
    return (
      <Typography variant="body2" color="text.secondary">
        Add ingredients to see live nutrition totals.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 2,
          borderRadius: APP_BORDER_RADIUS_SM,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          Per serving ({servings} total)
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {formatCalories(nutrition.perServing.calories)}
        </Typography>
        <Typography variant="body2">
          P {nutrition.perServing.protein}g · C {nutrition.perServing.carbs}g · F{' '}
          {nutrition.perServing.fat}g
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MacroTile label="Total" value={formatCalories(nutrition.total.calories)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MacroTile label="Protein" value={formatGrams(nutrition.total.protein)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MacroTile label="Carbs" value={formatGrams(nutrition.total.carbs)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MacroTile label="Weight" value={`${nutrition.totalWeightG}g`} />
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary">
        Per 100g: {formatCalories(nutrition.per100g.calories)} · P{' '}
        {nutrition.per100g.protein}g · C {nutrition.per100g.carbs}g · F {nutrition.per100g.fat}g
      </Typography>
    </Stack>
  );
}
