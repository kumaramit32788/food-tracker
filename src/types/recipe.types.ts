import type { RecipeCategory } from '@/constants/foodCategories.ts';
import type { NutritionPer100g, NutritionSnapshot } from '@/types/nutrition.types.ts';
import type { UnitType } from '@/types/unit.types.ts';

export interface RecipeIngredient {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unit: UnitType;
  quantityInBase: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  servings: number;
  ingredients: RecipeIngredient[];
  nutritionPerServing: NutritionSnapshot;
  nutritionPer100g: NutritionPer100g;
  totalWeightG: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredientInput {
  foodId: string;
  quantity: number;
  unit: UnitType;
}

export interface CreateRecipeInput {
  name: string;
  category: RecipeCategory;
  servings: number;
  ingredients: RecipeIngredientInput[];
}

export interface RecipeIngredientDraft extends RecipeIngredientInput {
  id: string;
  foodName: string;
}
