export interface NutritionPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

/** Frozen nutrition values stored on diary/recipe entries */
export interface NutritionSnapshot {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export const EMPTY_NUTRITION: NutritionPer100g = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

export function createNutritionSnapshot(nutrition: NutritionPer100g): NutritionSnapshot {
  return { ...nutrition };
}
