import { describe, expect, it } from 'vitest';
import type { Food } from '@/types/food.types.ts';
import { searchFoods } from './searchFoods.ts';

function makeFood(overrides: Partial<Food> & Pick<Food, 'id' | 'name'>): Food {
  return {
    aliases: [],
    category: 'Protein - Egg',
    isVegetarian: false,
    isVegan: false,
    isCustom: false,
    isRecipe: false,
    baseUnit: 'g',
    defaultServing: { unit: 'g', grams: 1 },
    availableUnits: [{ unit: 'g', grams: 1 }],
    nutritionPer100g: {
      calories: 100,
      protein: 10,
      carbs: 1,
      fat: 1,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    tags: [],
    isFavorite: false,
    searchText: overrides.name.toLowerCase(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('searchFoods', () => {
  const foods = [
    makeFood({ id: '1', name: 'Egg White (Boiled)', aliases: ['Egg White'] }),
    makeFood({ id: '2', name: 'Egg Fried Rice' }),
    makeFood({ id: '3', name: 'Boiled Egg (Whole)', aliases: ['Anda Ubalna'] }),
    makeFood({ id: '4', name: 'Brinjal (Cooked)', aliases: ['Eggplant Bharta'], category: 'Vegetables' }),
    makeFood({ id: '5', name: 'Egg Bhurji' }),
  ];

  it('ranks foods starting with the query before partial matches', () => {
    const results = searchFoods(foods, 'egg');
    const names = results.map((food) => food.name);

    expect(names.slice(0, 3)).toEqual(['Egg Bhurji', 'Egg Fried Rice', 'Egg White (Boiled)']);
    expect(names.indexOf('Boiled Egg (Whole)')).toBeGreaterThan(2);
    expect(names.at(-1)).toBe('Brinjal (Cooked)');
  });

  it('ranks exact word matches above substring-only matches', () => {
    const results = searchFoods(foods, 'egg');
    const eggFriedIndex = results.findIndex((food) => food.name === 'Egg Fried Rice');
    const boiledEggIndex = results.findIndex((food) => food.name === 'Boiled Egg (Whole)');
    expect(eggFriedIndex).toBeLessThan(boiledEggIndex);
  });
});
