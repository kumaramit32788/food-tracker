import { CURRENT_SEED_VERSION, SEED_META_KEY } from '@/constants/db.ts';
import { db } from '@/services/db/dexieDb.ts';
import { foodRepository, sanitizeFoodRecord } from '@/services/db/repositories/foodRepository.ts';
import type { Food } from '@/types/food.types.ts';

function dedupeSeedFoods(foods: Food[]): Food[] {
  const seen = new Set<string>();
  return foods
    .map(sanitizeFoodRecord)
    .filter((food) => {
      if (seen.has(food.id)) {
        return false;
      }
      seen.add(food.id);
      return true;
    });
}

export const seedService = {
  async initialize(): Promise<void> {
    const seedMeta = await db.meta.get(SEED_META_KEY);
    const foodCount = await foodRepository.count();

    if (seedMeta?.value === String(CURRENT_SEED_VERSION) && foodCount > 0) {
      return;
    }

    const response = await fetch('/data/foods.json');
    if (!response.ok) {
      throw new Error('Failed to load food database');
    }

    const foods = dedupeSeedFoods((await response.json()) as Food[]);
    await db.foods.clear();
    await foodRepository.bulkPut(foods);
    await db.meta.put({ key: SEED_META_KEY, value: String(CURRENT_SEED_VERSION) });
  },
};
