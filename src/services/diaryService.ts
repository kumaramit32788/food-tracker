import type { MealType } from '@/constants/mealTypes.ts';
import { diaryRepository } from '@/services/db/repositories/diaryRepository.ts';
import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import { recipeRepository } from '@/services/db/repositories/recipeRepository.ts';
import { db } from '@/services/db/dexieDb.ts';
import type { DiaryDay, DiaryEntry } from '@/types/diary.types.ts';
import type { QuantityInput } from '@/types/unit.types.ts';
import { toNutritionSnapshot } from '@/utils/calculateNutrition.ts';
import { convertToBaseUnit } from '@/utils/convertUnit.ts';
import { calculateFoodNutritionFromFood } from '@/utils/nutritionEngine.ts';

export interface LogFoodInput {
  date: string;
  mealType: MealType;
  foodId: string;
  quantity: QuantityInput;
}

export interface LogRecipeInput {
  date: string;
  mealType: MealType;
  recipeId: string;
  servings: number;
}

export const diaryService = {
  async getDayWithEntries(date: string): Promise<{ day: DiaryDay; entries: DiaryEntry[] }> {
    const [day, entries] = await Promise.all([
      diaryRepository.getOrCreateDay(date),
      diaryRepository.getEntriesByDate(date),
    ]);

    return { day, entries };
  },

  async getEntriesByDate(date: string): Promise<DiaryEntry[]> {
    return diaryRepository.getEntriesByDate(date);
  },

  async logFood(input: LogFoodInput): Promise<DiaryEntry> {
    const food = await foodRepository.getById(input.foodId);

    if (!food) {
      throw new Error('Food not found');
    }

    const nutrition = calculateFoodNutritionFromFood(food, input.quantity);
    const quantityInBase = convertToBaseUnit(food, input.quantity);

    return diaryRepository.createEntry({
      date: input.date,
      mealType: input.mealType,
      entryType: 'food',
      foodId: food.id,
      name: food.name,
      quantity: input.quantity.amount,
      unit: input.quantity.unit,
      quantityInBase,
      nutrition: toNutritionSnapshot({
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: roundSugar(food, quantityInBase),
        sodium: roundSodium(food, quantityInBase),
      }),
    });
  },

  async logRecipe(input: LogRecipeInput): Promise<DiaryEntry> {
    const recipe = await recipeRepository.getById(input.recipeId);

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const servings = input.servings > 0 ? input.servings : 1;
    const multiplier = servings;

    return diaryRepository.createEntry({
      date: input.date,
      mealType: input.mealType,
      entryType: 'recipe',
      recipeId: recipe.id,
      name: recipe.name,
      quantity: servings,
      unit: 'piece',
      quantityInBase: recipe.totalWeightG * (servings / recipe.servings),
      servings,
      nutrition: toNutritionSnapshot({
        calories: round1(recipe.nutritionPerServing.calories * multiplier),
        protein: round1(recipe.nutritionPerServing.protein * multiplier),
        carbs: round1(recipe.nutritionPerServing.carbs * multiplier),
        fat: round1(recipe.nutritionPerServing.fat * multiplier),
        fiber: round1(recipe.nutritionPerServing.fiber * multiplier),
        sugar: round1(recipe.nutritionPerServing.sugar * multiplier),
        sodium: round1(recipe.nutritionPerServing.sodium * multiplier),
      }),
    });
  },

  async removeEntry(id: string): Promise<void> {
    await diaryRepository.removeEntry(id);
  },

  async setWaterMl(date: string, waterMl: number): Promise<DiaryDay> {
    const day = await diaryRepository.getOrCreateDay(date);
    const updated = { ...day, waterMl: Math.max(0, waterMl) };
    await db.diaryDays.put(updated);
    return updated;
  },

  async getEntriesInRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
    return db.diaryEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function roundSugar(food: { nutritionPer100g: { sugar: number } }, quantityInBase: number) {
  return round1((food.nutritionPer100g.sugar * quantityInBase) / 100);
}

function roundSodium(food: { nutritionPer100g: { sodium: number } }, quantityInBase: number) {
  return round1((food.nutritionPer100g.sodium * quantityInBase) / 100);
}
