
import type { UserProfile } from '@/types/auth.types.ts';
import type { DiaryDay, DiaryEntry } from '@/types/diary.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { Recipe } from '@/types/recipe.types.ts';

/** Single Firestore doc — 1 read to check if any collection changed. */
export interface RemoteSyncMeta {
  profileUpdatedAt: string;
  customFoodsUpdatedAt: string;
  recipesUpdatedAt: string;
  foodPrefsUpdatedAt: string;
  /** monthKey (YYYY-MM) → ISO timestamp */
  diaryMonths: Record<string, string>;
  updatedAt: string;
}

export interface LocalSyncMeta {
  uid: string;
  profileUpdatedAt: string;
  customFoodsUpdatedAt: string;
  recipesUpdatedAt: string;
  foodPrefsUpdatedAt: string;
  diaryMonths: Record<string, string>;
  lastPullAt: string;
}

export interface FoodPrefsBundle {
  favoriteIds: string[];
  lastUsedAt: Record<string, string>;
  updatedAt: string;
}

export interface CustomFoodsBundle {
  items: Food[];
  updatedAt: string;
}

export interface RecipesBundle {
  items: Recipe[];
  updatedAt: string;
}

export interface DiaryMonthBundle {
  monthKey: string;
  days: DiaryDay[];
  entries: DiaryEntry[];
  updatedAt: string;
}

export interface SyncPullResult {
  readsUsed: number;
  profile: UserProfile | null;
  pulledCollections: string[];
}

export interface SyncPushStats {
  writesUsed: number;
}
