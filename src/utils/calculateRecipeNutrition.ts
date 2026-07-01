import type { Food } from '@/types/food.types.ts';
import type { NutritionPer100g } from '@/types/nutrition.types.ts';
import type { MacroNutrients } from '@/types/nutritionEngine.types.ts';
import type { QuantityInput } from '@/types/unit.types.ts';
import { toNutritionSnapshot } from '@/utils/calculateNutrition.ts';
import { convertToBaseUnit } from '@/utils/convertUnit.ts';
import { calculateFoodNutritionFromFood } from '@/utils/nutritionEngine.ts';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function toMacros(nutrition: NutritionPer100g): MacroNutrients {
  return {
    calories: round1(nutrition.calories),
    protein: round1(nutrition.protein),
    carbs: round1(nutrition.carbs),
    fat: round1(nutrition.fat),
    fiber: round1(nutrition.fiber),
  };
}

export interface RecipeNutritionResult {
  total: NutritionPer100g;
  perServing: NutritionPer100g;
  per100g: NutritionPer100g;
  totalWeightG: number;
  ingredients: Array<{
    foodId: string;
    foodName: string;
    quantity: QuantityInput;
    quantityInBase: number;
    nutrition: NutritionPer100g;
  }>;
}

export function calculateRecipeNutrition(
  items: Array<{ food: Food; quantity: QuantityInput }>,
  servings: number,
): RecipeNutritionResult {
  const safeServings = servings > 0 ? servings : 1;

  const ingredients = items.map(({ food, quantity }) => {
    const quantityInBase = convertToBaseUnit(food, quantity);
    const nutrition = calculateFoodNutritionFromFood(food, quantity);
    return {
      foodId: food.id,
      foodName: food.name,
      quantity,
      quantityInBase: round1(quantityInBase),
      nutrition: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: round1((food.nutritionPer100g.sugar * quantityInBase) / 100),
        sodium: round1((food.nutritionPer100g.sodium * quantityInBase) / 100),
      },
    };
  });

  const total = ingredients.reduce(
    (sum, item) => ({
      calories: round1(sum.calories + item.nutrition.calories),
      protein: round1(sum.protein + item.nutrition.protein),
      carbs: round1(sum.carbs + item.nutrition.carbs),
      fat: round1(sum.fat + item.nutrition.fat),
      fiber: round1(sum.fiber + item.nutrition.fiber),
      sugar: round1(sum.sugar + item.nutrition.sugar),
      sodium: round1(sum.sodium + item.nutrition.sodium),
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  );

  const totalWeightG = round1(
    ingredients.reduce((sum, item) => sum + item.quantityInBase, 0),
  );

  const perServing = {
    calories: round1(total.calories / safeServings),
    protein: round1(total.protein / safeServings),
    carbs: round1(total.carbs / safeServings),
    fat: round1(total.fat / safeServings),
    fiber: round1(total.fiber / safeServings),
    sugar: round1(total.sugar / safeServings),
    sodium: round1(total.sodium / safeServings),
  };

  const per100gScaled: NutritionPer100g =
    totalWeightG > 0
      ? {
          calories: round1((total.calories / totalWeightG) * 100),
          protein: round1((total.protein / totalWeightG) * 100),
          carbs: round1((total.carbs / totalWeightG) * 100),
          fat: round1((total.fat / totalWeightG) * 100),
          fiber: round1((total.fiber / totalWeightG) * 100),
          sugar: round1((total.sugar / totalWeightG) * 100),
          sodium: round1((total.sodium / totalWeightG) * 100),
        }
      : {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        };

  return {
    total,
    perServing,
    per100g: per100gScaled,
    totalWeightG,
    ingredients,
  };
}

export function recipeNutritionToSnapshot(nutrition: NutritionPer100g) {
  return toNutritionSnapshot(nutrition);
}

export { toMacros as recipeMacrosFromNutrition };
