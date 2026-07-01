import { db } from '@/services/db/dexieDb.ts';
import type { Recipe } from '@/types/recipe.types.ts';

export const recipeRepository = {
  async getAll(): Promise<Recipe[]> {
    return db.recipes.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<Recipe | null> {
    return (await db.recipes.get(id)) ?? null;
  },

  async create(recipe: Recipe): Promise<Recipe> {
    await db.recipes.put(recipe);
    return recipe;
  },

  async update(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const existing = await db.recipes.get(id);

    if (!existing) {
      throw new Error('Recipe not found');
    }

    const updated: Recipe = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    await db.recipes.put(updated);
    return updated;
  },

  async toggleFavorite(id: string): Promise<Recipe> {
    const recipe = await db.recipes.get(id);

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    return this.update(id, { isFavorite: !recipe.isFavorite });
  },

  async delete(id: string): Promise<void> {
    await db.recipes.delete(id);
  },

  async count(): Promise<number> {
    return db.recipes.count();
  },
};
