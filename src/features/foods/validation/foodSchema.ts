import { z } from 'zod';
import { FOOD_CATEGORIES } from '@/constants/foodCategories.ts';

const formNumber = (build: (schema: z.ZodNumber) => z.ZodNumber) => {
  const numberSchema = build(z.number({ error: 'This field is required' }));
  return z
    .union([numberSchema, z.literal('')])
    .refine((value) => value !== '', { message: 'This field is required' })
    .transform((value) => value as z.infer<typeof numberSchema>);
};

export const createFoodSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  category: z.enum(FOOD_CATEGORIES),
  calories: formNumber((n) => n.min(0)),
  protein: formNumber((n) => n.min(0)),
  carbs: formNumber((n) => n.min(0)),
  fat: formNumber((n) => n.min(0)),
  fiber: formNumber((n) => n.min(0)),
  sugar: formNumber((n) => n.min(0)),
  sodium: formNumber((n) => n.min(0)),
  servingAmount: formNumber((n) => n.positive('Serving amount must be greater than 0')),
  servingUnit: z.enum([
    'g',
    'kg',
    'ml',
    'L',
    'piece',
    'cup',
    'tbsp',
    'tsp',
    'katori',
    'bowl',
    'glass',
    'slice',
    'roti',
    'chapati',
    'egg',
    'banana',
    'apple',
  ]),
  isVegetarian: z.boolean(),
});

export type CreateFoodFormValues = z.infer<typeof createFoodSchema>;
export type CreateFoodFormInput = z.input<typeof createFoodSchema>;

export const DEFAULT_CREATE_FOOD_VALUES: CreateFoodFormValues = {
  name: '',
  category: 'Other',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  servingAmount: 100,
  servingUnit: 'g',
  isVegetarian: true,
};
