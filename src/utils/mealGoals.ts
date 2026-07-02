import { MEAL_TYPES } from '@/constants/mealTypes.ts';
import type { MealType } from '@/constants/mealTypes.ts';
import type { MacroNutrients } from '@/types/nutritionEngine.types.ts';

/** Share of daily targets allocated to each meal (sums to 1). */
export const MEAL_GOAL_SHARES: Record<MealType, number> = {
  'pre-workout': 0.1,
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.25,
  snacks: 0.1,
};

export interface DailyMacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export function distributeDailyGoalsToMeals(
  goals: DailyMacroGoals,
): Record<MealType, MacroNutrients> {
  return MEAL_TYPES.reduce(
    (acc, mealType) => {
      const share = MEAL_GOAL_SHARES[mealType];
      acc[mealType] = {
        calories: Math.round(goals.calories * share),
        protein: Math.round(goals.protein * share),
        carbs: Math.round(goals.carbs * share),
        fat: Math.round(goals.fat * share),
        fiber: Math.round((goals.fiber ?? 25) * share),
      };
      return acc;
    },
    {} as Record<MealType, MacroNutrients>,
  );
}
