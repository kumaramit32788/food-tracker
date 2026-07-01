import { describe, expect, it } from 'vitest';
import type { Food } from '@/types/food.types.ts';
import { convertToBaseUnit, getAvailableUnitsForFood, getDefaultServingForFood } from './convertUnit.ts';

const sampleFood: Pick<Food, 'baseUnit' | 'category' | 'name' | 'availableUnits'> = {
  baseUnit: 'g',
  category: 'Dal & Legumes',
  name: 'Dal',
  availableUnits: [
    { unit: 'g' as const, grams: 1 },
    { unit: 'katori' as const, grams: 150 },
    { unit: 'piece' as const, grams: 40 },
  ],
};

const eggWhite: Pick<Food, 'baseUnit' | 'category' | 'name' | 'availableUnits' | 'defaultServing'> = {
  baseUnit: 'g',
  category: 'Protein - Egg',
  name: 'Egg White (Boiled)',
  defaultServing: { unit: 'katori', grams: 150 },
  availableUnits: [
    { unit: 'g', grams: 1 },
    { unit: 'katori', grams: 150 },
    { unit: 'bowl', grams: 180 },
  ],
};

describe('convertToBaseUnit', () => {
  it('converts grams directly', () => {
    expect(convertToBaseUnit(sampleFood, { amount: 250, unit: 'g' })).toBe(250);
  });

  it('uses food-specific household units', () => {
    expect(convertToBaseUnit(sampleFood, { amount: 2, unit: 'katori' })).toBe(300);
    expect(convertToBaseUnit(sampleFood, { amount: 3, unit: 'piece' })).toBe(120);
  });

  it('falls back to master conversions when unit is not on food', () => {
    expect(convertToBaseUnit(sampleFood, { amount: 1, unit: 'tbsp' })).toBe(14);
  });

  it('uses egg weight for all protein egg foods', () => {
    expect(convertToBaseUnit(eggWhite, { amount: 2, unit: 'egg' })).toBe(66);
  });

  it('uses egg weight for omelette-style egg foods', () => {
    const omelette: Pick<Food, 'baseUnit' | 'category' | 'name' | 'availableUnits'> = {
      baseUnit: 'g',
      category: 'Protein - Egg',
      name: 'Omelette (Plain)',
      availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'katori', grams: 150 }],
    };
    expect(convertToBaseUnit(omelette, { amount: 2, unit: 'egg' })).toBe(100);
  });
});

describe('getAvailableUnitsForFood', () => {
  it('prefers food override over master default for piece', () => {
    const units = getAvailableUnitsForFood(sampleFood);
    expect(units.find((unit) => unit.unit === 'piece')?.grams).toBe(40);
  });

  it('shows egg units and hides katori for all egg foods', () => {
    const units = getAvailableUnitsForFood(eggWhite);
    expect(units.map((unit) => unit.unit)).toEqual(expect.arrayContaining(['g', 'kg', 'egg']));
    expect(units.map((unit) => unit.unit)).not.toContain('katori');
    expect(units.map((unit) => unit.unit)).not.toContain('piece');
    expect(units.find((unit) => unit.unit === 'egg')?.grams).toBe(33);
  });

  it('shows egg unit for omelette egg foods', () => {
    const omelette: Pick<Food, 'baseUnit' | 'category' | 'name' | 'availableUnits'> = {
      baseUnit: 'g',
      category: 'Protein - Egg',
      name: 'Omelette (Plain)',
      availableUnits: [{ unit: 'g', grams: 1 }, { unit: 'katori', grams: 150 }],
    };
    const units = getAvailableUnitsForFood(omelette);
    expect(units.map((unit) => unit.unit)).toContain('egg');
    expect(units.map((unit) => unit.unit)).not.toContain('katori');
  });
});

describe('getDefaultServingForFood', () => {
  it('defaults all egg foods to 1 egg instead of katori', () => {
    expect(getDefaultServingForFood(eggWhite)).toEqual({ amount: 1, unit: 'egg' });
  });
});
