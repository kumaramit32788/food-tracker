import type { MealType } from '@/constants/mealTypes.ts';
import { db } from '@/services/db/dexieDb.ts';
import type { DiaryDay, DiaryEntry } from '@/types/diary.types.ts';
import type { NutritionSnapshot } from '@/types/nutrition.types.ts';

const EMPTY_DAY_TOTALS = {
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
  totalFiber: 0,
  totalSugar: 0,
  totalSodium: 0,
  waterMl: 0,
};

export function getDiaryDayId(date: string) {
  return `day-${date}`;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function sumDayTotals(entries: DiaryEntry[]): Omit<DiaryDay, 'id' | 'date'> {
  return entries.reduce(
    (totals, entry) => ({
      totalCalories: round1(totals.totalCalories + entry.nutrition.calories),
      totalProtein: round1(totals.totalProtein + entry.nutrition.protein),
      totalCarbs: round1(totals.totalCarbs + entry.nutrition.carbs),
      totalFat: round1(totals.totalFat + entry.nutrition.fat),
      totalFiber: round1(totals.totalFiber + entry.nutrition.fiber),
      totalSugar: round1(totals.totalSugar + entry.nutrition.sugar),
      totalSodium: round1(totals.totalSodium + entry.nutrition.sodium),
      waterMl: totals.waterMl,
    }),
    { ...EMPTY_DAY_TOTALS },
  );
}

export const diaryRepository = {
  async getDay(date: string): Promise<DiaryDay | null> {
    return (await db.diaryDays.get(getDiaryDayId(date))) ?? null;
  },

  async getOrCreateDay(date: string): Promise<DiaryDay> {
    const id = getDiaryDayId(date);
    const existing = await db.diaryDays.get(id);

    if (existing) {
      return existing;
    }

    const day: DiaryDay = {
      id,
      date,
      ...EMPTY_DAY_TOTALS,
    };

    await db.diaryDays.put(day);
    return day;
  },

  async getEntriesByDate(date: string): Promise<DiaryEntry[]> {
    return db.diaryEntries.where('date').equals(date).sortBy('loggedAt');
  },

  async addEntry(entry: DiaryEntry): Promise<DiaryEntry> {
    await db.diaryEntries.put(entry);
    await this.recomputeDayTotals(entry.date);
    return entry;
  },

  async removeEntry(id: string): Promise<void> {
    const entry = await db.diaryEntries.get(id);

    if (!entry) {
      return;
    }

    await db.diaryEntries.delete(id);
    await this.recomputeDayTotals(entry.date);
  },

  async recomputeDayTotals(date: string): Promise<DiaryDay> {
    const entries = await this.getEntriesByDate(date);
    const totals = sumDayTotals(entries);
    const day = await this.getOrCreateDay(date);
    const updated: DiaryDay = { ...day, ...totals };
    await db.diaryDays.put(updated);
    return updated;
  },

  async createEntry(input: {
    date: string;
    mealType: MealType;
    entryType: DiaryEntry['entryType'];
    foodId?: string;
    recipeId?: string;
    name: string;
    quantity: number;
    unit: DiaryEntry['unit'];
    quantityInBase: number;
    servings?: number;
    nutrition: NutritionSnapshot;
  }): Promise<DiaryEntry> {
    const day = await this.getOrCreateDay(input.date);
    const now = new Date().toISOString();

    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      diaryDayId: day.id,
      date: input.date,
      mealType: input.mealType,
      entryType: input.entryType,
      foodId: input.foodId,
      recipeId: input.recipeId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      quantityInBase: input.quantityInBase,
      servings: input.servings,
      nutrition: input.nutrition,
      loggedAt: now,
    };

    return this.addEntry(entry);
  },
};
