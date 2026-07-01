import { z } from 'zod';
import { FOOD_CATEGORIES } from '@/constants/foodCategories.ts';

const nonNegativeNumber = z.number().min(0);

export const createFoodSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  category: z.enum(FOOD_CATEGORIES),
  calories: nonNegativeNumber,
  protein: nonNegativeNumber,
  carbs: nonNegativeNumber,
  fat: nonNegativeNumber,
  fiber: nonNegativeNumber,
  sugar: nonNegativeNumber,
  sodium: nonNegativeNumber,
  servingAmount: z.number().positive('Serving amount must be greater than 0'),
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
