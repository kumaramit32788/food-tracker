export type UnitType =
  | 'g'
  | 'kg'
  | 'ml'
  | 'L'
  | 'piece'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'katori'
  | 'bowl'
  | 'glass'
  | 'slice'
  | 'roti'
  | 'chapati'
  | 'egg'
  | 'banana'
  | 'apple';

export type BaseUnit = 'g' | 'ml';

export interface FoodUnitConversion {
  unit: UnitType;
  /** Grams or millilitres per 1 unit of this measure */
  grams: number;
  label?: string;
}

export interface QuantityInput {
  amount: number;
  unit: UnitType;
}
