import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import { recipeRepository } from '@/services/db/repositories/recipeRepository.ts';
import type { CreateRecipeInput, Recipe, RecipeIngredient } from '@/types/recipe.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { QuantityInput } from '@/types/unit.types.ts';
import {
  calculateRecipeNutrition,
  recipeNutritionToSnapshot,
} from '@/utils/calculateRecipeNutrition.ts';

async function resolveIngredients(
  ingredients: CreateRecipeInput['ingredients'],
): Promise<Array<{ food: Food; quantity: QuantityInput }>> {
  const items: Array<{ food: Food; quantity: QuantityInput }> = [];

  for (const ingredient of ingredients) {
    const food = await foodRepository.getById(ingredient.foodId);

    if (!food) {
      throw new Error(`Food not found: ${ingredient.foodId}`);
    }

    items.push({
      food,
      quantity: { amount: ingredient.quantity, unit: ingredient.unit },
    });
  }

  return items;
}

function buildRecipeRecord(
  input: CreateRecipeInput,
  nutrition: ReturnType<typeof calculateRecipeNutrition>,
): Recipe {
  const now = new Date().toISOString();

  const ingredients: RecipeIngredient[] = nutrition.ingredients.map((item) => ({
    id: crypto.randomUUID(),
    foodId: item.foodId,
    foodName: item.foodName,
    quantity: item.quantity.amount,
    unit: item.quantity.unit,
    quantityInBase: item.quantityInBase,
  }));

  return {
    id: crypto.randomUUID(),
    name: input.name,
    category: input.category,
    servings: input.servings,
    ingredients,
    nutritionPerServing: recipeNutritionToSnapshot(nutrition.perServing),
    nutritionPer100g: nutrition.per100g,
    totalWeightG: nutrition.totalWeightG,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const recipeService = {
  async getAllRecipes(): Promise<Recipe[]> {
    return recipeRepository.getAll();
  },

  async getRecipeById(id: string): Promise<Recipe | null> {
    return recipeRepository.getById(id);
  },

  async calculateRecipePreview(
    ingredients: CreateRecipeInput['ingredients'],
    servings: number,
  ) {
    const items = await resolveIngredients(ingredients);
    return calculateRecipeNutrition(items, servings);
  },

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    if (input.ingredients.length === 0) {
      throw new Error('Add at least one ingredient');
    }

    if (input.servings <= 0) {
      throw new Error('Servings must be greater than 0');
    }

    const items = await resolveIngredients(input.ingredients);
    const nutrition = calculateRecipeNutrition(items, input.servings);
    const recipe = buildRecipeRecord(input, nutrition);
    return recipeRepository.create(recipe);
  },

  async deleteRecipe(id: string): Promise<void> {
    await recipeRepository.delete(id);
  },

  async toggleFavorite(id: string): Promise<Recipe> {
    return recipeRepository.toggleFavorite(id);
  },
};
