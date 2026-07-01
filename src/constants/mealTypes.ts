export const MEAL_TYPES = ['pre-workout', 'breakfast', 'lunch', 'dinner', 'snacks'] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  'pre-workout': 'Pre-workout',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

export function isMealType(value: string | null | undefined): value is MealType {
  return MEAL_TYPES.includes(value as MealType);
}
