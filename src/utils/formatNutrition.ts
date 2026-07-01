export function formatCalories(value: number): string {
  return `${Math.round(value)} kcal`;
}

export function formatGrams(value: number, unit = 'g'): string {
  return `${Math.round(value * 10) / 10}${unit}`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${Math.round((grams / 1000) * 10) / 10} kg`;
  }

  return `${Math.round(grams)} g`;
}
