import { Box, Chip, Stack, Typography } from '@mui/material';
import type { FoodCategory } from '@/constants/foodCategories.ts';
import { FOOD_CATEGORIES } from '@/constants/foodCategories.ts';
import type { DietFilter } from '@/utils/dietFilter.ts';

interface FoodCategoryFilterProps {
  selectedCategory: FoodCategory | null;
  categoryCounts: Map<FoodCategory, number>;
  dietFilter: DietFilter;
  onCategoryChange: (category: FoodCategory | null) => void;
  onDietFilterChange: (value: DietFilter) => void;
}

export function FoodCategoryFilter({
  selectedCategory,
  categoryCounts,
  dietFilter,
  onCategoryChange,
  onDietFilterChange,
}: FoodCategoryFilterProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
          CATEGORIES
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label="Veg only"
            size="small"
            color={dietFilter === 'veg' ? 'success' : 'default'}
            variant={dietFilter === 'veg' ? 'filled' : 'outlined'}
            onClick={() => onDietFilterChange(dietFilter === 'veg' ? 'all' : 'veg')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip
            label="Non-veg only"
            size="small"
            color={dietFilter === 'nonVeg' ? 'warning' : 'default'}
            variant={dietFilter === 'nonVeg' ? 'filled' : 'outlined'}
            onClick={() => onDietFilterChange(dietFilter === 'nonVeg' ? 'all' : 'nonVeg')}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
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
