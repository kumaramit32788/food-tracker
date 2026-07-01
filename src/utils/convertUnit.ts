import { MASTER_UNIT_CONVERSIONS } from '@/constants/units.ts';
import type { Food } from '@/types/food.types.ts';
import type { FoodUnitConversion, QuantityInput, UnitType } from '@/types/unit.types.ts';
import {
  getEggUnitGrams,
  getEggUnitsForFood,
  isEggFood,
  shouldExcludeVolumeUnitForEgg,
} from '@/utils/foodUnits.ts';

type FoodUnitContext = Pick<Food, 'availableUnits' | 'baseUnit'> &
  Partial<Pick<Food, 'category' | 'name'>>;

export function getUnitConversion(food: FoodUnitContext, unit: UnitType): FoodUnitConversion {
  const foodOverride = food.availableUnits.find((item) => item.unit === unit);

  if (foodOverride) {
    return foodOverride;
  }

  if (
    food.category &&
    food.name &&
    isEggFood(food as Pick<Food, 'category'>) &&
    unit === 'egg'
  ) {
    const eggGrams = getEggUnitGrams(food as Pick<Food, 'name' | 'availableUnits'>);
    return {
      unit,
      grams: eggGrams,
      label: 'Egg',
    };
  }

  const master = MASTER_UNIT_CONVERSIONS[unit];

  return {
    unit,
    grams: master.toBase,
    label: master.label,
  };
}

/**
 * Converts any household unit to base grams or millilitres.
 */
export function convertToBaseUnit(food: FoodUnitContext, quantity: QuantityInput): number {
  const conversion = getUnitConversion(food, quantity.unit);
  return quantity.amount * conversion.grams;
}

/**
 * Converts base grams/ml back to a display unit.
 */
export function convertFromBaseUnit(
  food: FoodUnitContext,
  baseAmount: number,
  unit: UnitType,
): number {
  const conversion = getUnitConversion(food, unit);
  return baseAmount / conversion.grams;
}

export function getAvailableUnitsForFood(
  food: Pick<Food, 'availableUnits' | 'baseUnit' | 'category' | 'name'>,
): FoodUnitConversion[] {
  const units = new Map<UnitType, FoodUnitConversion>();

  food.availableUnits.forEach((item) => {
    units.set(item.unit, item);
  });

  if (isEggFood(food)) {
    getEggUnitsForFood(food).forEach((unit) => {
      if (!units.has(unit.unit)) {
        units.set(unit.unit, unit);
      }
    });
  } else {
    const defaults: UnitType[] =
      food.baseUnit === 'ml'
        ? ['ml', 'L', 'glass', 'cup', 'tbsp', 'tsp', 'katori', 'bowl']
        : ['g', 'kg', 'piece', 'katori', 'bowl', 'cup', 'tbsp', 'tsp'];

    defaults.forEach((unit) => {
      if (!units.has(unit)) {
        const master = MASTER_UNIT_CONVERSIONS[unit];
        units.set(unit, { unit, grams: master.toBase, label: master.label });
      }
    });
  }

  return Array.from(units.values()).filter(
    (unit) => !shouldExcludeVolumeUnitForEgg(food, unit.unit),
  );
}

export function getDefaultServingForFood(
  food: Pick<Food, 'defaultServing' | 'category' | 'name' | 'availableUnits'>,
): QuantityInput {
  if (isEggFood(food)) {
    return { amount: 1, unit: 'egg' };
  }

  return { amount: 1, unit: food.defaultServing.unit };
}

export function roundServingAmount(amount: number): number {
  if (amount >= 10) {
    return Math.round(amount);
  }
  if (amount >= 1) {
    return Math.round(amount * 10) / 10;
  }
  return Math.round(amount * 100) / 100;
}
