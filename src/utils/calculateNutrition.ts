import type { NutritionPer100g, NutritionSnapshot } from '@/types/nutrition.types.ts';
import { EMPTY_NUTRITION } from '@/types/nutrition.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { QuantityInput } from '@/types/unit.types.ts';
import { convertToBaseUnit } from '@/utils/convertUnit.ts';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function scaleNutrient(per100g: number, baseQuantity: number): number {
  return round1((per100g * baseQuantity) / 100);
}

/**
 * Calculate nutrition from per-100g values and a quantity in any supported unit.
 */
export function calculateNutrition(
  nutritionPer100g: NutritionPer100g,
  baseQuantityGramsOrMl: number,
): NutritionPer100g {
  if (baseQuantityGramsOrMl <= 0) {
    return { ...EMPTY_NUTRITION };
  }

  return {
    calories: scaleNutrient(nutritionPer100g.calories, baseQuantityGramsOrMl),
    protein: scaleNutrient(nutritionPer100g.protein, baseQuantityGramsOrMl),
    carbs: scaleNutrient(nutritionPer100g.carbs, baseQuantityGramsOrMl),
    fat: scaleNutrient(nutritionPer100g.fat, baseQuantityGramsOrMl),
    fiber: scaleNutrient(nutritionPer100g.fiber, baseQuantityGramsOrMl),
    sugar: scaleNutrient(nutritionPer100g.sugar, baseQuantityGramsOrMl),
    sodium: scaleNutrient(nutritionPer100g.sodium, baseQuantityGramsOrMl),
  };
}

export function calculateFoodNutrition(food: Food, quantity: QuantityInput): NutritionPer100g {
  const baseQuantity = convertToBaseUnit(food, quantity);
  return calculateNutrition(food.nutritionPer100g, baseQuantity);
}

export function toNutritionSnapshot(nutrition: NutritionPer100g): NutritionSnapshot {
  return { ...nutrition };
}

export function sumNutrition(items: NutritionPer100g[]): NutritionPer100g {
  return items.reduce(
    (total, item) => ({
      calories: round1(total.calories + item.calories),
      protein: round1(total.protein + item.protein),
      carbs: round1(total.carbs + item.carbs),
      fat: round1(total.fat + item.fat),
      fiber: round1(total.fiber + item.fiber),
      sugar: round1(total.sugar + item.sugar),
      sodium: round1(total.sodium + item.sodium),
    }),
    { ...EMPTY_NUTRITION },
  );
}
