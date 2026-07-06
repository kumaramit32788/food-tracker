import type { FoodCategory } from '@/constants/foodCategories.ts';
import { communityFoodService } from '@/services/firebase/communityFoodService.ts';
import { cloudSync } from '@/services/firebase/cloudSync.ts';
import { getCurrentSyncUid } from '@/services/firebase/syncContext.ts';
import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import type { CreateFoodInput, Food, FoodSearchResult } from '@/types/food.types.ts';
import type { QuantityInput } from '@/types/unit.types.ts';
import { filterVisibleFoods } from '@/utils/foodVisibility.ts';
import { calculateFoodNutrition, toNutritionSnapshot } from '@/utils/calculateNutrition.ts';
import { convertToBaseUnit, getAvailableUnitsForFood } from '@/utils/convertUnit.ts';
import { groupSearchResults, searchFoods } from '@/utils/searchFoods.ts';

export const foodService = {
  async getAllFoods(uid?: string | null): Promise<Food[]> {
    const foods = await foodRepository.getAll();
    return filterVisibleFoods(foods, uid ?? getCurrentSyncUid());
  },

  async getFoodById(id: string): Promise<Food | null> {
    return foodRepository.getById(id);
  },

  async getFoodsByCategory(category: FoodCategory): Promise<Food[]> {
    return foodRepository.getByCategory(category);
  },

  async getFavorites(): Promise<Food[]> {
    return foodRepository.getFavorites();
  },

  async getRecentFoods(limit = 20): Promise<Food[]> {
    return foodRepository.getRecent(limit);
  },

  async search(query: string, limit = 50, uid?: string | null): Promise<FoodSearchResult[]> {
    const foods = await this.getAllFoods(uid);
    return searchFoods(foods, query, limit);
  },

  async searchGrouped(query: string, limit = 50, uid?: string | null) {
    const results = await this.search(query, limit, uid);
    return groupSearchResults(results);
  },

  async createCustomFood(input: CreateFoodInput): Promise<Food> {
    const uid = getCurrentSyncUid();
    if (!uid) {
      throw new Error('Sign in to create custom foods that sync to the community queue');
    }

    const food = await foodRepository.create(input, uid);
    await communityFoodService.submitPendingFood(food, uid);
    await cloudSync.afterCustomFoodChange();
    return food;
  },

  async updateFood(id: string, updates: Partial<Food>): Promise<Food> {
    return foodRepository.update(id, updates);
  },

  async toggleFavorite(id: string): Promise<Food> {
    const food = await foodRepository.toggleFavorite(id);
    await cloudSync.afterFoodPrefChange();
    return food;
  },

  async markFoodAsUsed(id: string): Promise<void> {
    await foodRepository.markAsUsed(id);
    await cloudSync.afterFoodPrefChange();
  },

  async deleteFood(id: string): Promise<void> {
    const food = await foodRepository.getById(id);

    if (!food?.isCustom || food.isCommunityFood) {
      throw new Error('Only your personal custom foods can be deleted');
    }

    const uid = getCurrentSyncUid();
    if (food.createdByUid && uid && food.createdByUid !== uid) {
      throw new Error('You can only delete foods you submitted');
    }

    await foodRepository.delete(id);
    await cloudSync.afterCustomFoodChange();
  },

  async calculateNutritionForFood(foodId: string, quantity: QuantityInput) {
    const food = await foodRepository.getById(foodId);

    if (!food) {
      throw new Error('Food not found');
    }

    const nutrition = calculateFoodNutrition(food, quantity);
    const baseQuantity = convertToBaseUnit(food, quantity);

    return {
      food,
      quantity,
      quantityInBase: baseQuantity,
      nutrition,
      snapshot: toNutritionSnapshot(nutrition),
      availableUnits: getAvailableUnitsForFood(food),
    };
  },
};
