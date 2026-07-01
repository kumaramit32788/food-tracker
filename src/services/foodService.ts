import type { FoodCategory } from '@/constants/foodCategories.ts';
import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import type { CreateFoodInput, Food, FoodSearchResult } from '@/types/food.types.ts';
import type { QuantityInput } from '@/types/unit.types.ts';
import { calculateFoodNutrition, toNutritionSnapshot } from '@/utils/calculateNutrition.ts';
import { convertToBaseUnit, getAvailableUnitsForFood } from '@/utils/convertUnit.ts';
import { groupSearchResults, searchFoods } from '@/utils/searchFoods.ts';

export const foodService = {
  async getAllFoods(): Promise<Food[]> {
    return foodRepository.getAll();
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

  async search(query: string, limit = 50): Promise<FoodSearchResult[]> {
    const foods = await foodRepository.getAll();
    return searchFoods(foods, query, limit);
  },

  async searchGrouped(query: string, limit = 50) {
    const results = await this.search(query, limit);
    return groupSearchResults(results);
  },

  async createCustomFood(input: CreateFoodInput): Promise<Food> {
    return foodRepository.create(input);
  },

  async updateFood(id: string, updates: Partial<Food>): Promise<Food> {
    return foodRepository.update(id, updates);
  },

  async toggleFavorite(id: string): Promise<Food> {
    return foodRepository.toggleFavorite(id);
  },

  async markFoodAsUsed(id: string): Promise<void> {
    await foodRepository.markAsUsed(id);
  },

  async deleteFood(id: string): Promise<void> {
    const food = await foodRepository.getById(id);

    if (!food?.isCustom) {
      throw new Error('Only custom foods can be deleted');
    }

    await foodRepository.delete(id);
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
