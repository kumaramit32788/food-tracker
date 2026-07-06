import type { FoodCategory } from '@/constants/foodCategories.ts';
import { db } from '@/services/db/dexieDb.ts';
import type { CreateFoodInput, Food } from '@/types/food.types.ts';
import type { FoodUnitConversion } from '@/types/unit.types.ts';
import type { UnitType } from '@/types/unit.types.ts';
import { shouldExcludeVolumeUnitForEgg } from '@/utils/foodUnits.ts';
import { buildSearchText } from '@/utils/searchFoods.ts';

function createFoodRecord(
  input: CreateFoodInput & {
    id?: string;
    isCustom?: boolean;
    createdByUid?: string;
    moderationStatus?: Food['moderationStatus'];
  },
): Food {
  const now = new Date().toISOString();

  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    aliases: input.aliases ?? [],
    category: input.category,
    subcategory: input.subcategory,
    brand: input.brand,
    isVegetarian: input.isVegetarian ?? true,
    isVegan: input.isVegan ?? false,
    isCustom: input.isCustom ?? true,
    isCommunityFood: false,
    moderationStatus: input.moderationStatus ?? (input.isCustom === false ? undefined : 'pending'),
    createdByUid: input.createdByUid,
    isRecipe: false,
    baseUnit: input.baseUnit ?? 'g',
    defaultServing: input.defaultServing,
    availableUnits: input.availableUnits,
    nutritionPer100g: input.nutritionPer100g,
    image: input.image,
    tags: input.tags ?? [],
    isFavorite: false,
    searchText: buildSearchText(input),
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeFoodName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function dedupeUnits(units: FoodUnitConversion[]): FoodUnitConversion[] {
  const map = new Map<UnitType, FoodUnitConversion>();
  units.forEach((unit) => {
    if (!map.has(unit.unit)) {
      map.set(unit.unit, unit);
    }
  });
  return Array.from(map.values());
}

export function sanitizeFoodRecord(food: Food): Food {
  const availableUnits = dedupeUnits(food.availableUnits).filter(
    (unit) => !shouldExcludeVolumeUnitForEgg(food, unit.unit),
  );

  let defaultServing = food.defaultServing;
  if (
    shouldExcludeVolumeUnitForEgg(food, food.defaultServing.unit) &&
    availableUnits.length > 0
  ) {
    const preferred = availableUnits.find((unit) => unit.unit === 'egg') ?? availableUnits[0];
    defaultServing = { unit: preferred.unit, grams: preferred.grams };
  }

  return {
    ...food,
    availableUnits,
    defaultServing,
  };
}

export const foodRepository = {
  async count(): Promise<number> {
    return db.foods.count();
  },

  async getAll(): Promise<Food[]> {
    return db.foods.toArray();
  },

  async getById(id: string): Promise<Food | null> {
    return (await db.foods.get(id)) ?? null;
  },

  async findByName(name: string): Promise<Food | null> {
    const normalized = normalizeFoodName(name);
    const foods = await db.foods.toArray();
    return (
      foods.find(
        (food) => food.isCustom && normalizeFoodName(food.name) === normalized,
      ) ?? null
    );
  },

  async getByCategory(category: FoodCategory): Promise<Food[]> {
    return db.foods.where('category').equals(category).toArray();
  },

  async getFavorites(): Promise<Food[]> {
    return db.foods.filter((food) => food.isFavorite).toArray();
  },

  async getRecent(limit = 20): Promise<Food[]> {
    return db.foods
      .filter((food) => Boolean(food.lastUsedAt))
      .toArray()
      .then((foods) =>
        foods
          .sort((a, b) => Date.parse(b.lastUsedAt ?? '0') - Date.parse(a.lastUsedAt ?? '0'))
          .slice(0, limit),
      );
  },

  async bulkPut(foods: Food[]): Promise<void> {
    await db.foods.bulkPut(foods.map(sanitizeFoodRecord));
  },

  async create(input: CreateFoodInput, createdByUid?: string): Promise<Food> {
    const duplicate = await this.findByName(input.name);
    if (duplicate) {
      throw new Error(`A custom food named "${input.name}" already exists`);
    }

    const pieceUnits: UnitType[] = ['piece', 'egg', 'banana', 'apple', 'roti', 'chapati', 'slice'];
    const usesPiece = input.availableUnits.some((u) => pieceUnits.includes(u.unit));
    const hasPieceWeight = input.availableUnits.some(
      (u) => pieceUnits.includes(u.unit) && u.grams > 1,
    );
    if (usesPiece && !hasPieceWeight) {
      throw new Error('Piece-based foods must include a serving weight in grams');
    }

    const food = sanitizeFoodRecord(
      createFoodRecord({
        ...input,
        isCustom: true,
        createdByUid,
        moderationStatus: 'pending',
      }),
    );
    await db.foods.put(food);
    return food;
  },

  async update(id: string, updates: Partial<Food>): Promise<Food> {
    const existing = await db.foods.get(id);

    if (!existing) {
      throw new Error('Food not found');
    }

    const updated: Food = sanitizeFoodRecord({
      ...existing,
      ...updates,
      id: existing.id,
      searchText: buildSearchText({
        name: updates.name ?? existing.name,
        aliases: updates.aliases ?? existing.aliases,
        tags: updates.tags ?? existing.tags,
        category: updates.category ?? existing.category,
        subcategory: updates.subcategory ?? existing.subcategory,
      }),
      updatedAt: new Date().toISOString(),
    });

    await db.foods.put(updated);
    return updated;
  },

  async toggleFavorite(id: string): Promise<Food> {
    const food = await db.foods.get(id);

    if (!food) {
      throw new Error('Food not found');
    }

    return this.update(id, { isFavorite: !food.isFavorite });
  },

  async markAsUsed(id: string): Promise<void> {
    await this.update(id, { lastUsedAt: new Date().toISOString() });
  },

  async delete(id: string): Promise<void> {
    await db.foods.delete(id);
  },
};
