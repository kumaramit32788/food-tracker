import type { Food } from '@/types/food.types.ts';
import type { FoodUnitConversion, UnitType } from '@/types/unit.types.ts';

export function isEggFood(food: Pick<Food, 'category'>): boolean {
  return food.category.includes('Egg');
}

export function getEggUnitGrams(food: Pick<Food, 'name' | 'availableUnits'>): number {
  const override = food.availableUnits.find(
    (unit) => (unit.unit === 'egg' || unit.unit === 'piece') && unit.grams > 1,
  );
  if (override) {
    return override.grams;
  }

  const name = food.name.toLowerCase();
  if (name.includes('white')) {
    return 33;
  }
  if (name.includes('yolk')) {
    return 17;
  }
  return 50;
}

export function getEggUnitsForFood(
  food: Pick<Food, 'name' | 'availableUnits'>,
): FoodUnitConversion[] {
  const eggGrams = getEggUnitGrams(food);
  return [
    { unit: 'g', grams: 1, label: 'Gram' },
    { unit: 'kg', grams: 1000, label: 'Kilogram' },
    { unit: 'egg', grams: eggGrams, label: 'Egg' },
  ];
}

const VOLUME_UNITS: UnitType[] = ['katori', 'bowl', 'cup', 'glass', 'tbsp', 'tsp'];

export function shouldExcludeVolumeUnitForEgg(
  food: Pick<Food, 'name' | 'category'>,
  unit: UnitType,
): boolean {
  if (!isEggFood(food)) {
    return false;
  }
  return VOLUME_UNITS.includes(unit) || unit === 'piece';
}
