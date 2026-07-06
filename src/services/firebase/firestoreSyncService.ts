import {
  doc,
  deleteDoc,
  getDoc,
  setDoc,
  type DocumentReference,
} from 'firebase/firestore';
import { PROFILE_RECORD_ID } from '@/constants/db.ts';
import { db } from '@/services/db/dexieDb.ts';
import { deviceRepository } from '@/services/db/deviceRepository.ts';
import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import { recipeRepository } from '@/services/db/repositories/recipeRepository.ts';
import { getFirestoreDb } from '@/services/firebase/firebaseApp.ts';
import { firestorePaths } from '@/services/firebase/firestorePaths.ts';
import { communityFoodService } from '@/services/firebase/communityFoodService.ts';
import { isPersonalCustomFood } from '@/utils/foodVisibility.ts';
import { getDiaryMonthsToPull, shouldPullCollection, stripUndefinedDeep } from '@/services/firebase/syncUtils.ts';
import type {
  CustomFoodsBundle,
  DiaryMonthBundle,
  FoodPrefsBundle,
  LocalSyncMeta,
  RecipesBundle,
  RemoteSyncMeta,
  SyncPullResult,
  SyncPushStats,
} from '@/services/firebase/syncTypes.ts';
import type { UserProfile } from '@/types/auth.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { Recipe } from '@/types/recipe.types.ts';
const LOCAL_SYNC_META_KEY = 'firebase-sync-meta';
const EMPTY_REMOTE_META: RemoteSyncMeta = {
  profileUpdatedAt: '',
  customFoodsUpdatedAt: '',
  recipesUpdatedAt: '',
  foodPrefsUpdatedAt: '',
  diaryMonths: {},
  updatedAt: '',
};

let pendingDiaryMonths = new Set<string>();
let diaryPushChain: Promise<SyncPushStats> = Promise.resolve({ writesUsed: 0 });
let activeUid: string | null = null;
let sessionPullCompleted = false;

function nowIso(): string {
  return new Date().toISOString();
}

async function getDocData<T>(ref: DocumentReference): Promise<T | null> {
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as T) : null;
}

export const firestoreSyncService = {
  setActiveUser(uid: string | null) {
    activeUid = uid;
    sessionPullCompleted = false;
    pendingDiaryMonths.clear();
    diaryPushChain = Promise.resolve({ writesUsed: 0 });
  },

  async getLocalSyncMeta(uid: string): Promise<LocalSyncMeta | null> {
    const record = await db.meta.get(`${LOCAL_SYNC_META_KEY}-${uid}`);
    if (!record?.value) return null;
    try {
      return JSON.parse(record.value) as LocalSyncMeta;
    } catch {
      return null;
    }
  },

  async saveLocalSyncMeta(meta: LocalSyncMeta): Promise<void> {
    await db.meta.put({
      key: `${LOCAL_SYNC_META_KEY}-${meta.uid}`,
      value: JSON.stringify(meta),
    });
  },

  async pullUserData(uid: string, force = false): Promise<SyncPullResult> {
    if (!force && sessionPullCompleted && activeUid === uid) {
      const profile = await deviceRepository.getProfile();
      return { readsUsed: 0, profile, pulledCollections: [] };
    }

    let readsUsed = 0;
    const pulledCollections: string[] = [];
    const fs = getFirestoreDb();

    const remoteMeta =
      (await getDocData<RemoteSyncMeta>(doc(fs, firestorePaths.syncMeta(uid)))) ?? EMPTY_REMOTE_META;
    readsUsed += 1;

    const localMeta = (await this.getLocalSyncMeta(uid)) ?? {
      uid,
      profileUpdatedAt: '',
      customFoodsUpdatedAt: '',
      recipesUpdatedAt: '',
      foodPrefsUpdatedAt: '',
      diaryMonths: {},
      lastPullAt: '',
    };

    let profile: UserProfile | null = await deviceRepository.getProfile();

    if (shouldPullCollection(remoteMeta.profileUpdatedAt, localMeta.profileUpdatedAt)) {
      const remoteProfile = await getDocData<UserProfile & { updatedAt?: string }>(
        doc(fs, firestorePaths.profile(uid)),
      );
      readsUsed += 1;
      if (remoteProfile) {
        const { updatedAt: _u, ...profileData } = remoteProfile;
        await deviceRepository.saveProfile(profileData);
        profile = profileData;
        pulledCollections.push('profile');
      }
    }

    if (shouldPullCollection(remoteMeta.customFoodsUpdatedAt, localMeta.customFoodsUpdatedAt)) {
      const bundle = await getDocData<CustomFoodsBundle>(
        doc(fs, firestorePaths.bundle.customFoods(uid)),
      );
      readsUsed += 1;
      if (bundle?.items) {
        await this.applyCustomFoods(bundle.items, uid);
        pulledCollections.push('customFoods');
      }
    }

    if (shouldPullCollection(remoteMeta.recipesUpdatedAt, localMeta.recipesUpdatedAt)) {
      const bundle = await getDocData<RecipesBundle>(doc(fs, firestorePaths.bundle.recipes(uid)));
      readsUsed += 1;
      if (bundle?.items) {
        await this.applyRecipes(bundle.items);
        pulledCollections.push('recipes');
      }
    }

    if (shouldPullCollection(remoteMeta.foodPrefsUpdatedAt, localMeta.foodPrefsUpdatedAt)) {
      const bundle = await getDocData<FoodPrefsBundle>(
        doc(fs, firestorePaths.bundle.foodPrefs(uid)),
      );
      readsUsed += 1;
      if (bundle) {
        await this.applyFoodPrefs(bundle);
        pulledCollections.push('foodPrefs');
      }
    }

    const monthsToPull = getDiaryMonthsToPull(remoteMeta.diaryMonths, localMeta.diaryMonths);

    for (const monthKey of monthsToPull) {
      const bundle = await getDocData<DiaryMonthBundle>(
        doc(fs, firestorePaths.bundle.diaryMonth(uid, monthKey)),
      );
      readsUsed += 1;
      if (bundle) {
        await this.applyDiaryMonth(bundle);
        pulledCollections.push(`diary-${monthKey}`);
      }
    }

    await this.saveLocalSyncMeta({
      uid,
      profileUpdatedAt: remoteMeta.profileUpdatedAt || localMeta.profileUpdatedAt,
      customFoodsUpdatedAt: remoteMeta.customFoodsUpdatedAt || localMeta.customFoodsUpdatedAt,
      recipesUpdatedAt: remoteMeta.recipesUpdatedAt || localMeta.recipesUpdatedAt,
      foodPrefsUpdatedAt: remoteMeta.foodPrefsUpdatedAt || localMeta.foodPrefsUpdatedAt,
      diaryMonths: { ...localMeta.diaryMonths, ...remoteMeta.diaryMonths },
      lastPullAt: nowIso(),
    });

    sessionPullCompleted = true;
    activeUid = uid;

    const communityPull = await communityFoodService.pullApprovedFoods(force);
    readsUsed += communityPull.readsUsed;
    if (communityPull.pulled) {
      pulledCollections.push('communityFoods');
    }

    return { readsUsed, profile, pulledCollections };
  },

  async pushProfile(uid: string, profile: UserProfile): Promise<SyncPushStats> {
    const fs = getFirestoreDb();
    const ts = nowIso();

    await setDoc(doc(fs, firestorePaths.profile(uid)), { ...profile, updatedAt: ts });
    await setDoc(
      doc(fs, firestorePaths.syncMeta(uid)),
      { profileUpdatedAt: ts, updatedAt: ts },
      { merge: true },
    );

    const localMeta = await this.getLocalSyncMeta(uid);
    if (localMeta) {
      await this.saveLocalSyncMeta({ ...localMeta, profileUpdatedAt: ts });
    }

    return { writesUsed: 2 };
  },

  async pushCustomFoods(uid: string): Promise<SyncPushStats> {
    await communityFoodService.submitPendingFoods(uid);

    const items = (await foodRepository.getAll()).filter(
      (food) => isPersonalCustomFood(food) && food.createdByUid === uid,
    );
    const ts = nowIso();
    const fs = getFirestoreDb();

    await setDoc(
      doc(fs, firestorePaths.bundle.customFoods(uid)),
      stripUndefinedDeep({ items, updatedAt: ts }),
    );
    await setDoc(
      doc(fs, firestorePaths.syncMeta(uid)),
      { customFoodsUpdatedAt: ts, updatedAt: ts },
      { merge: true },
    );

    const localMeta = await this.getLocalSyncMeta(uid);
    if (localMeta) {
      await this.saveLocalSyncMeta({ ...localMeta, customFoodsUpdatedAt: ts });
    }

    return { writesUsed: 2 };
  },

  async pushRecipes(uid: string): Promise<SyncPushStats> {
    const items = await recipeRepository.getAll();
    const ts = nowIso();
    const fs = getFirestoreDb();

    await setDoc(doc(fs, firestorePaths.bundle.recipes(uid)), { items, updatedAt: ts });
    await setDoc(
      doc(fs, firestorePaths.syncMeta(uid)),
      { recipesUpdatedAt: ts, updatedAt: ts },
      { merge: true },
    );

    const localMeta = await this.getLocalSyncMeta(uid);
    if (localMeta) {
      await this.saveLocalSyncMeta({ ...localMeta, recipesUpdatedAt: ts });
    }

    return { writesUsed: 2 };
  },

  async pushFoodPrefs(uid: string): Promise<SyncPushStats> {
    const allFoods = await foodRepository.getAll();
    const favoriteIds = allFoods.filter((f) => f.isFavorite).map((f) => f.id);
    const lastUsedAt: Record<string, string> = {};
    for (const food of allFoods) {
      if (food.lastUsedAt) lastUsedAt[food.id] = food.lastUsedAt;
    }

    const ts = nowIso();
    const fs = getFirestoreDb();

    await setDoc(doc(fs, firestorePaths.bundle.foodPrefs(uid)), {
      favoriteIds,
      lastUsedAt,
      updatedAt: ts,
    } satisfies FoodPrefsBundle);
    await setDoc(
      doc(fs, firestorePaths.syncMeta(uid)),
      { foodPrefsUpdatedAt: ts, updatedAt: ts },
      { merge: true },
    );

    const localMeta = await this.getLocalSyncMeta(uid);
    if (localMeta) {
      await this.saveLocalSyncMeta({ ...localMeta, foodPrefsUpdatedAt: ts });
    }

    return { writesUsed: 2 };
  },

  queueDiaryPush(uid: string, monthKey: string): Promise<SyncPushStats> {
    pendingDiaryMonths.add(monthKey);
    diaryPushChain = diaryPushChain
      .then(() => this.flushDiaryPush(uid))
      .catch((error) => {
        console.warn('[sync] Diary push failed', error);
        return { writesUsed: 0 };
      });
    return diaryPushChain;
  },

  async flushDiaryPush(uid: string): Promise<SyncPushStats> {
    const months = [...pendingDiaryMonths];
    pendingDiaryMonths.clear();

    if (months.length === 0) return { writesUsed: 0 };

    let writesUsed = 0;
    const fs = getFirestoreDb();
    const diaryMonths: Record<string, string> = {};

    for (const monthKey of months) {
      const [year, month] = monthKey.split('-').map(Number);
      const startDate = `${monthKey}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

      const entries = await db.diaryEntries
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray();
      const dayIds = new Set(entries.map((e) => e.diaryDayId));
      const days = (await db.diaryDays.toArray()).filter((d) => dayIds.has(d.id));

      const ts = nowIso();
      await setDoc(
        doc(fs, firestorePaths.bundle.diaryMonth(uid, monthKey)),
        stripUndefinedDeep({
          monthKey,
          days,
          entries,
          updatedAt: ts,
        } satisfies DiaryMonthBundle),
      );
      diaryMonths[monthKey] = ts;
      writesUsed += 1;
    }

    const ts = nowIso();
    await setDoc(
      doc(fs, firestorePaths.syncMeta(uid)),
      { diaryMonths, updatedAt: ts },
      { merge: true },
    );
    writesUsed += 1;

    const localMeta = await this.getLocalSyncMeta(uid);
    if (localMeta) {
      await this.saveLocalSyncMeta({
        ...localMeta,
        diaryMonths: { ...localMeta.diaryMonths, ...diaryMonths },
      });
    }

    return { writesUsed };
  },

  async applyCustomFoods(items: Food[], uid: string) {
    const personalItems = items.filter((food) => isPersonalCustomFood(food));
    const existingPersonal = (await foodRepository.getAll()).filter(
      (f) => isPersonalCustomFood(f) && f.createdByUid === uid,
    );
    const remoteIds = new Set(personalItems.map((f) => f.id));
    for (const food of existingPersonal) {
      if (!remoteIds.has(food.id)) await foodRepository.delete(food.id);
    }
    if (personalItems.length > 0) {
      await foodRepository.bulkPut(
        personalItems.map((food) => ({
          ...food,
          createdByUid: food.createdByUid ?? uid,
          moderationStatus: food.moderationStatus ?? 'pending',
          isCommunityFood: false,
        })),
      );
    }
  },

  async applyRecipes(items: Recipe[]) {
    const existing = await recipeRepository.getAll();
    const remoteIds = new Set(items.map((r) => r.id));
    for (const recipe of existing) {
      if (!remoteIds.has(recipe.id)) await recipeRepository.delete(recipe.id);
    }
    for (const recipe of items) {
      await db.recipes.put(recipe);
    }
  },

  async applyFoodPrefs(bundle: FoodPrefsBundle) {
    const allFoods = await foodRepository.getAll();
    const favoriteSet = new Set(bundle.favoriteIds);
    for (const food of allFoods) {
      const shouldFavorite = favoriteSet.has(food.id);
      const lastUsed = bundle.lastUsedAt[food.id];
      const updates: Partial<Food> = {};
      if (food.isFavorite !== shouldFavorite) updates.isFavorite = shouldFavorite;
      if (lastUsed && food.lastUsedAt !== lastUsed) updates.lastUsedAt = lastUsed;
      if (Object.keys(updates).length > 0) {
        await foodRepository.update(food.id, updates);
      }
    }
  },

  async applyDiaryMonth(bundle: DiaryMonthBundle) {
    for (const day of bundle.days) {
      await db.diaryDays.put(day);
    }
    const remoteEntryIds = new Set(bundle.entries.map((e) => e.id));
    const [year, month] = bundle.monthKey.split('-').map(Number);
    const startDate = `${bundle.monthKey}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${bundle.monthKey}-${String(lastDay).padStart(2, '0')}`;

    const localEntries = await db.diaryEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();

    for (const entry of localEntries) {
      if (!remoteEntryIds.has(entry.id)) {
        await db.diaryEntries.delete(entry.id);
      }
    }

    for (const entry of bundle.entries) {
      await db.diaryEntries.put(entry);
    }
  },

  async clearUserLocalData() {
    await db.diaryEntries.clear();
    await db.diaryDays.clear();
    await db.recipes.clear();
    const customFoods = (await foodRepository.getAll()).filter((f) => f.isCustom);
    for (const food of customFoods) {
      await foodRepository.delete(food.id);
    }
    await db.profile.delete(PROFILE_RECORD_ID);
  },

  async deleteUserCloudData(uid: string): Promise<void> {
    const fs = getFirestoreDb();
    const remoteMeta =
      (await getDocData<RemoteSyncMeta>(doc(fs, firestorePaths.syncMeta(uid)))) ?? EMPTY_REMOTE_META;

    const refs = [
      doc(fs, firestorePaths.profile(uid)),
      doc(fs, firestorePaths.syncMeta(uid)),
      doc(fs, firestorePaths.bundle.customFoods(uid)),
      doc(fs, firestorePaths.bundle.recipes(uid)),
      doc(fs, firestorePaths.bundle.foodPrefs(uid)),
      ...Object.keys(remoteMeta.diaryMonths).map((monthKey) =>
        doc(fs, firestorePaths.bundle.diaryMonth(uid, monthKey)),
      ),
    ];

    await Promise.all(
      refs.map(async (ref) => {
        try {
          await deleteDoc(ref);
        } catch {
          // Ignore missing docs or offline failures during local-only cleanup
        }
      }),
    );

    await db.meta.delete(`${LOCAL_SYNC_META_KEY}-${uid}`);
  },
};

export function scheduleDiarySync(uid: string, date: string): Promise<SyncPushStats> {
  const monthKey = date.slice(0, 7);
  return firestoreSyncService.queueDiaryPush(uid, monthKey);
}
