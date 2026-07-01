import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { FavoriteButton } from '@/features/foods/components/FavoriteButton.tsx';
import type { Food } from '@/types/food.types.ts';
import { formatCalories } from '@/utils/formatNutrition.ts';

interface FoodCardProps {
  food: Food;
  onSelect: (food: Food) => void;
  onToggleFavorite: (food: Food) => void;
  isTogglingFavorite?: boolean;
}

export function FoodCard({
  food,
  onSelect,
  onToggleFavorite,
  isTogglingFavorite = false,
}: FoodCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => onSelect(food)} sx={{ height: '100%' }}>
        <Box sx={{ p: 2, height: '100%' }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {food.name}
                </Typography>
              </Box>
              <FavoriteButton
                isFavorite={food.isFavorite}
                isLoading={isTogglingFavorite}
                onToggle={() => onToggleFavorite(food)}
              />
            </Stack>

            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              <Chip label={food.category} size="small" variant="outlined" />
              {food.isCustom && <Chip label="Custom" size="small" color="secondary" variant="outlined" />}
              {food.isVegetarian && (
                <Chip label="Veg" size="small" color="success" variant="outlined" />
              )}
            </Stack>

            <Stack
              direction="row"
              sx={{ mt: 'auto', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="body2" color="text.secondary">
                {formatCalories(food.nutritionPer100g.calories)}
                <Typography component="span" variant="caption" color="text.secondary">
                  {' '}
                  / 100{food.baseUnit}
                </Typography>
              </Typography>
              <ChevronRightOutlinedIcon fontSize="small" color="action" />
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
}
