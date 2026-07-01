import { Box, Chip, Stack, Typography } from '@mui/material';
import type { FoodCategory } from '@/constants/foodCategories.ts';
import { FOOD_CATEGORIES } from '@/constants/foodCategories.ts';

interface FoodCategoryFilterProps {
  selectedCategory: FoodCategory | null;
  categoryCounts: Map<FoodCategory, number>;
  vegOnly: boolean;
  onCategoryChange: (category: FoodCategory | null) => void;
  onVegOnlyChange: (value: boolean) => void;
}

export function FoodCategoryFilter({
  selectedCategory,
  categoryCounts,
  vegOnly,
  onCategoryChange,
  onVegOnlyChange,
}: FoodCategoryFilterProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
          CATEGORIES
        </Typography>
        <Chip
          label="Veg only"
          size="small"
          color={vegOnly ? 'success' : 'default'}
          variant={vegOnly ? 'filled' : 'outlined'}
          onClick={() => onVegOnlyChange(!vegOnly)}
          sx={{ cursor: 'pointer' }}
        />
      </Stack>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Chip
          label="All"
          color={selectedCategory === null ? 'primary' : 'default'}
          variant={selectedCategory === null ? 'filled' : 'outlined'}
          onClick={() => onCategoryChange(null)}
          sx={{ flexShrink: 0 }}
        />
        {FOOD_CATEGORIES.map((category) => {
          const count = categoryCounts.get(category) ?? 0;
          if (count === 0) {
            return null;
          }

          const isSelected = selectedCategory === category;

          return (
            <Chip
              key={category}
              label={`${category} (${count})`}
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => onCategoryChange(isSelected ? null : category)}
              sx={{ flexShrink: 0 }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
