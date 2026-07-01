import type { UnitType } from '@/types/unit.types.ts';

export interface MasterUnitDefinition {
  unit: UnitType;
  label: string;
  /** Grams or millilitres per 1 unit */
  toBase: number;
}

/**
 * Master unit conversion table.
 * Food-specific overrides live on each Food.availableUnits entry.
 */
export const MASTER_UNIT_CONVERSIONS: Record<UnitType, MasterUnitDefinition> = {
  g: { unit: 'g', label: 'Gram', toBase: 1 },
  kg: { unit: 'kg', label: 'Kilogram', toBase: 1000 },
  ml: { unit: 'ml', label: 'Millilitre', toBase: 1 },
  L: { unit: 'L', label: 'Litre', toBase: 1000 },
  piece: { unit: 'piece', label: 'Piece', toBase: 100 },
  cup: { unit: 'cup', label: 'Cup', toBase: 240 },
  tbsp: { unit: 'tbsp', label: 'Tablespoon', toBase: 14 },
  tsp: { unit: 'tsp', label: 'Teaspoon', toBase: 5 },
  katori: { unit: 'katori', label: 'Katori', toBase: 150 },
  bowl: { unit: 'bowl', label: 'Bowl', toBase: 180 },
  glass: { unit: 'glass', label: 'Glass', toBase: 250 },
  slice: { unit: 'slice', label: 'Slice', toBase: 30 },
  roti: { unit: 'roti', label: 'Roti', toBase: 40 },
  chapati: { unit: 'chapati', label: 'Chapati', toBase: 40 },
  egg: { unit: 'egg', label: 'Egg', toBase: 50 },
  banana: { unit: 'banana', label: 'Banana', toBase: 120 },
  apple: { unit: 'apple', label: 'Apple', toBase: 180 },
};

export const ALL_UNITS = Object.keys(MASTER_UNIT_CONVERSIONS) as UnitType[];

export const WEIGHT_UNITS: UnitType[] = ['g', 'kg', 'piece', 'cup', 'tbsp', 'tsp', 'katori', 'bowl', 'slice', 'roti', 'chapati', 'egg', 'banana', 'apple'];
export const VOLUME_UNITS: UnitType[] = ['ml', 'L', 'cup', 'tbsp', 'tsp', 'katori', 'bowl', 'glass'];
