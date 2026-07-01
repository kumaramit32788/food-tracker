import { Box, Grid, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { FoodCard } from '@/features/foods/components/FoodCard.tsx';
import type { Food } from '@/types/food.types.ts';

interface FoodListSectionProps {
  title: string;
  subtitle?: string;
  foods: Food[];
  emptyMessage?: string;
  onSelect: (food: Food) => void;
  onToggleFavorite: (food: Food) => void;
  togglingFavoriteId?: string | null;
  action?: ReactNode;
}

export function FoodListSection({
  title,
  subtitle,
  foods,
  emptyMessage,
  onSelect,
  onToggleFavorite,
  togglingFavoriteId,
  action,
}: FoodListSectionProps) {
  if (foods.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>

      <Grid container spacing={2}>
        {foods.map((food) => (
          <Grid key={food.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <FoodCard
              food={food}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
              isTogglingFavorite={togglingFavoriteId === food.id}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
