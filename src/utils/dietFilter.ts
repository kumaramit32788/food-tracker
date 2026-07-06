import type { Food } from '@/types/food.types.ts';

export type DietFilter = 'all' | 'veg' | 'nonVeg';

export function matchesDietFilter(food: Food, dietFilter: DietFilter): boolean {
  if (dietFilter === 'veg') {
    return food.isVegetarian;
  }
  if (dietFilter === 'nonVeg') {
    return !food.isVegetarian;
  }
  return true;
}

export function filterByDiet<T extends Food>(foods: T[], dietFilter: DietFilter): T[] {
  if (dietFilter === 'all') {
    return foods;
  }
  return foods.filter((food) => matchesDietFilter(food, dietFilter));
}
