import type { MealType } from '@/constants/mealTypes.ts';
import type { NutritionPer100g } from '@/types/nutrition.types.ts';
import type { BaseUnit, FoodUnitConversion, QuantityInput } from '@/types/unit.types.ts';

/** Core macros returned by the nutrition engine */
export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodCalculationInput {
  name: string;
  nutritionPer100g: NutritionPer100g;
  quantity: QuantityInput;
  baseUnit?: BaseUnit;
  availableUnits?: FoodUnitConversion[];
}

export interface FoodCalculationResult extends MacroNutrients {
  food: string;
  quantity: string;
  quantityInBase: number;
  baseUnit: BaseUnit;
  multiplier: number;
  explanation: string;
}

export interface MealFoodInput extends FoodCalculationInput {}

export interface MealCalculationInput {
  mealType: MealType;
  foods: MealFoodInput[];
}

export interface MealCalculationResult extends MacroNutrients {
  mealType: MealType;
  label: string;
  foods: FoodCalculationResult[];
  explanation: string;
}

export interface DailyIntakeGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MacroProgress {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export type DailyMealTotals = Record<MealType, MacroNutrients>;

export interface DailyIntakeResult {
  meals: DailyMealTotals;
  dailyTotal: MacroNutrients;
  remainingCalories: number;
  progress: MacroProgress;
  warnings: string[];
  explanation: string;
}

export interface DailyIntakeInput {
  goals: DailyIntakeGoals;
  meals: MealCalculationInput[];
}
