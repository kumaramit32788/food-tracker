import { describe, expect, it } from 'vitest';
import type { DiaryEntry } from '@/types/diary.types.ts';
import {
  calculateDailyIntakeFromDiaryEntries,
  calculateFoodNutritionDetailed,
  calculatePeriodIntakeFromDiaryEntries,
  sumDiaryEntryMacros,
} from './nutritionEngine.ts';

const ricePer100g = {
  calories: 130,
  protein: 2.7,
  carbs: 28,
  fat: 0.3,
  fiber: 0.4,
  sugar: 0,
  sodium: 1,
};

function makeEntry(partial: Partial<DiaryEntry> & Pick<DiaryEntry, 'mealType'>): DiaryEntry {
  return {
    id: partial.id ?? 'entry-1',
    diaryDayId: partial.diaryDayId ?? 'day-1',
    date: partial.date ?? '2026-07-01',
    mealType: partial.mealType,
    entryType: partial.entryType ?? 'food',
    name: partial.name ?? 'Rice',
    quantity: partial.quantity ?? 1,
    unit: partial.unit ?? 'katori',
    quantityInBase: partial.quantityInBase ?? 150,
    nutrition: partial.nutrition ?? {
      calories: 195,
      protein: 4.1,
      carbs: 42,
      fat: 0.5,
      fiber: 0.6,
      sugar: 0,
      sodium: 1.5,
    },
    loggedAt: partial.loggedAt ?? '2026-07-01T08:00:00.000Z',
  };
}

describe('calculateFoodNutritionDetailed', () => {
  it('calculates nutrition from per-100g values and quantity', () => {
    const result = calculateFoodNutritionDetailed({
      name: 'Rice',
      nutritionPer100g: ricePer100g,
      quantity: { amount: 150, unit: 'g' },
      baseUnit: 'g',
      availableUnits: [{ unit: 'g', grams: 1 }],
    });

    expect(result.calories).toBe(195);
    expect(result.protein).toBe(4.1);
    expect(result.carbs).toBe(42);
  });
});

describe('sumDiaryEntryMacros', () => {
  it('sums snapshots without double rounding drift', () => {
    const total = sumDiaryEntryMacros([
      makeEntry({
        mealType: 'breakfast',
        nutrition: {
          calories: 100.4,
          protein: 10.2,
          carbs: 12.3,
          fat: 3.1,
          fiber: 2.2,
          sugar: 0,
          sodium: 0,
        },
      }),
      makeEntry({
        id: 'entry-2',
        mealType: 'lunch',
        nutrition: {
          calories: 200.6,
          protein: 20.1,
          carbs: 22.4,
          fat: 5.2,
          fiber: 4.1,
          sugar: 0,
          sodium: 0,
        },
      }),
    ]);

    expect(total.calories).toBe(301);
    expect(total.protein).toBe(30.3);
  });
});

describe('calculateDailyIntakeFromDiaryEntries', () => {
  it('groups entries by meal and computes progress', () => {
    const result = calculateDailyIntakeFromDiaryEntries(
      { calories: 2000, protein: 120, carbs: 250, fat: 65, fiber: 25 },
      [
        makeEntry({ mealType: 'breakfast' }),
        makeEntry({ id: 'entry-2', mealType: 'lunch', nutrition: makeEntry({ mealType: 'lunch' }).nutrition }),
      ],
    );

    expect(result.dailyTotal.calories).toBe(390);
    expect(result.meals.breakfast.calories).toBe(195);
    expect(result.meals.lunch.calories).toBe(195);
    expect(result.progress.protein).toBeGreaterThan(0);
  });
});

describe('calculatePeriodIntakeFromDiaryEntries', () => {
  it('aggregates multi-day entries with daily averages', () => {
    const summary = calculatePeriodIntakeFromDiaryEntries([
      makeEntry({ date: '2026-07-01', mealType: 'breakfast' }),
      makeEntry({ id: 'entry-2', date: '2026-07-02', mealType: 'lunch' }),
    ]);

    expect(summary.daysLogged).toBe(2);
    expect(summary.total.calories).toBe(390);
    expect(summary.avgDaily.calories).toBe(195);
  });
});
