import { Chip } from '@mui/material';
import type { Food } from '@/types/food.types.ts';
import { getModerationLabel, isCommunityApprovedFood, isPersonalCustomFood } from '@/utils/foodVisibility.ts';

interface FoodModerationChipProps {
  food: Food;
}

export function FoodModerationChip({ food }: FoodModerationChipProps) {
  if (!food.isCustom) {
    return null;
  }

  if (isCommunityApprovedFood(food)) {
    return <Chip label="Community" size="small" color="primary" variant="outlined" />;
  }

  if (!isPersonalCustomFood(food)) {
    return null;
  }

  const status = food.moderationStatus ?? 'pending';

  if (status === 'pending') {
    return <Chip label={getModerationLabel(status)} size="small" color="warning" variant="outlined" />;
  }

  if (status === 'rejected') {
    return <Chip label={getModerationLabel(status)} size="small" color="error" variant="outlined" />;
  }

  return null;
}
