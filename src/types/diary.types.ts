import type { NutritionSnapshot } from '@/types/nutrition.types.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import type { UnitType } from '@/types/unit.types.ts';

export type DiaryEntryType = 'food' | 'recipe';

export interface DiaryEntry {
  id: string;
  diaryDayId: string;
  date: string;
  mealType: MealType;
  entryType: DiaryEntryType;
  foodId?: string;
  recipeId?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  quantityInBase: number;
  servings?: number;
  /** Snapshot — never recalculated when food data changes */
  nutrition: NutritionSnapshot;
  loggedAt: string;
}

export interface DiaryDay {
  id: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterMl: number;
}
