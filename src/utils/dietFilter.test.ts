import { describe, expect, it } from 'vitest';
import type { Food } from '@/types/food.types.ts';
import { filterByDiet, matchesDietFilter } from './dietFilter.ts';

const vegFood = { isVegetarian: true } as Food;
const nonVegFood = { isVegetarian: false } as Food;

describe('matchesDietFilter', () => {
  it('returns all foods when filter is all', () => {
    expect(matchesDietFilter(vegFood, 'all')).toBe(true);
    expect(matchesDietFilter(nonVegFood, 'all')).toBe(true);
  });

  it('filters vegetarian foods only', () => {
    expect(matchesDietFilter(vegFood, 'veg')).toBe(true);
    expect(matchesDietFilter(nonVegFood, 'veg')).toBe(false);
  });

  it('filters non-vegetarian foods only', () => {
    expect(matchesDietFilter(nonVegFood, 'nonVeg')).toBe(true);
    expect(matchesDietFilter(vegFood, 'nonVeg')).toBe(false);
  });
});

describe('filterByDiet', () => {
  it('filters a mixed list to non-veg only', () => {
    expect(filterByDiet([vegFood, nonVegFood], 'nonVeg')).toEqual([nonVegFood]);
  });
});
