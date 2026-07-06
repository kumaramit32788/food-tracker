import type { FoodCategory } from '@/constants/foodCategories.ts';
import type { NutritionPer100g } from '@/types/nutrition.types.ts';
import type { BaseUnit, FoodUnitConversion } from '@/types/unit.types.ts';

export type FoodModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Food {
  id: string;
  name: string;
  aliases: string[];
  category: FoodCategory;
  subcategory?: string;
  brand?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isCustom: boolean;
  isRecipe: boolean;
  /** Approved shared food visible to all users */
  isCommunityFood?: boolean;
  /** Moderation state for user-submitted foods */
  moderationStatus?: FoodModerationStatus;
  /** Firebase UID of the user who submitted this custom food */
  createdByUid?: string;
  baseUnit: BaseUnit;
  defaultServing: FoodUnitConversion;
  availableUnits: FoodUnitConversion[];
  nutritionPer100g: NutritionPer100g;
  image?: string;
  tags: string[];
  isFavorite: boolean;
  lastUsedAt?: string;
  /** Lowercase name + aliases + tags for fast search */
  searchText: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodInput {
  name: string;
  aliases?: string[];
  category: FoodCategory;
  subcategory?: string;
  brand?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  baseUnit?: BaseUnit;
  defaultServing: FoodUnitConversion;
  availableUnits: FoodUnitConversion[];
  nutritionPer100g: NutritionPer100g;
  image?: string;
  tags?: string[];
}

export interface FoodSearchResult extends Food {
  matchScore: number;
}

export interface RecentFood {
  foodId: string;
  lastUsedAt: string;
}
