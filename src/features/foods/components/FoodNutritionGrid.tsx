import { Box, Divider, Stack, Typography } from '@mui/material';
import type { NutritionPer100g } from '@/types/nutrition.types.ts';
import { formatCalories, formatGrams } from '@/utils/formatNutrition.ts';

interface NutritionRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function NutritionRow({ label, value, highlight = false }: NutritionRowProps) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: highlight ? 700 : 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

interface FoodNutritionGridProps {
  title: string;
  nutrition: NutritionPer100g;
  baseUnit?: 'g' | 'ml';
}

export function FoodNutritionGrid({ title, nutrition, baseUnit = 'g' }: FoodNutritionGridProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <NutritionRow label="Calories" value={formatCalories(nutrition.calories)} highlight />
      <Divider sx={{ my: 0.5 }} />
      <NutritionRow label="Protein" value={formatGrams(nutrition.protein)} />
      <NutritionRow label="Carbs" value={formatGrams(nutrition.carbs)} />
      <NutritionRow label="Fat" value={formatGrams(nutrition.fat)} />
      <NutritionRow label="Fiber" value={formatGrams(nutrition.fiber)} />
      <NutritionRow label="Sugar" value={formatGrams(nutrition.sugar)} />
      <NutritionRow label="Sodium" value={formatGrams(nutrition.sodium, 'mg')} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Values per 100{baseUnit} reference
      </Typography>
    </Box>
  );
}
