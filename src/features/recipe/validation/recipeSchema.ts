import { z } from 'zod';
import { RECIPE_CATEGORIES } from '@/constants/foodCategories.ts';

export const recipeSchema = z.object({
  name: z.string().trim().min(2, 'Recipe name must be at least 2 characters'),
  category: z.enum(RECIPE_CATEGORIES),
  servings: z.number().min(1, 'At least 1 serving'),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
