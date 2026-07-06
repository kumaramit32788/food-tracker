import type { Food, FoodModerationStatus } from '@/types/food.types.ts';

export function isCommunityApprovedFood(food: Food): boolean {
  return Boolean(food.isCommunityFood && food.moderationStatus === 'approved');
}

export function isPersonalCustomFood(food: Food): boolean {
  return food.isCustom && !food.isCommunityFood;
}

export function isFoodVisibleToUser(food: Food, uid: string | null): boolean {
  if (!food.isCustom) {
    return true;
  }

  if (isCommunityApprovedFood(food)) {
    return true;
  }

  if (!uid) {
    return false;
  }

  return food.createdByUid === uid;
}

export function filterVisibleFoods(foods: Food[], uid: string | null): Food[] {
  return foods.filter((food) => isFoodVisibleToUser(food, uid));
}

export function getModerationLabel(status: FoodModerationStatus | undefined): string {
  switch (status) {
    case 'pending':
      return 'Pending approval';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending approval';
  }
}
