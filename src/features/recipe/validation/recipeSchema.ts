import { z } from 'zod';
import { RECIPE_CATEGORIES } from '@/constants/foodCategories.ts';

const formNumber = (build: (schema: z.ZodNumber) => z.ZodNumber) => {
  const numberSchema = build(z.number({ error: 'This field is required' }));
  return z
    .union([numberSchema, z.literal('')])
    .refine((value) => value !== '', { message: 'This field is required' })
    .transform((value) => value as z.infer<typeof numberSchema>);
};

export const recipeSchema = z.object({
  name: z.string().trim().min(2, 'Recipe name must be at least 2 characters'),
  category: z.enum(RECIPE_CATEGORIES),
  servings: formNumber((n) => n.min(1, 'At least 1 serving')),
});

export type RecipeFormValues = z.output<typeof recipeSchema>;
export type RecipeFormInput = z.input<typeof recipeSchema>;
