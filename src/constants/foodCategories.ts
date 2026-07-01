export const FOOD_CATEGORIES = [
  'Rice',
  'Dal & Legumes',
  'Breads & Roti',
  'Flour & Grains',
  'South Indian',
  'North Indian',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Protein - Chicken',
  'Protein - Fish',
  'Protein - Egg',
  'Protein - Mutton',
  'Oils & Fats',
  'Dry Fruits & Nuts',
  'Snacks',
  'Drinks',
  'Spices & Condiments',
  'Paneer & Tofu',
  'Other',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Drink',
  'Dessert',
  'Sauce',
  'Side Dish',
  'Custom',
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];
