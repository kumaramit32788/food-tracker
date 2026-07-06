import { getCurrentSyncUid } from '@/services/firebase/syncContext.ts';
import {
  firestoreSyncService,
  scheduleDiarySync,
} from '@/services/firebase/firestoreSyncService.ts';
import type { UserProfile } from '@/types/auth.types.ts';

export const cloudSync = {
  async afterProfileSave(profile: UserProfile) {
    const uid = getCurrentSyncUid();
    if (!uid) return;
    await firestoreSyncService.pushProfile(uid, profile);
  },

  afterDiaryChange(date: string) {
    const uid = getCurrentSyncUid();
    if (!uid) return;
    scheduleDiarySync(uid, date);
  },

  async afterCustomFoodChange() {
    const uid = getCurrentSyncUid();
    if (!uid) return;
    await firestoreSyncService.pushCustomFoods(uid);
  },

  async afterRecipeChange() {
    const uid = getCurrentSyncUid();
    if (!uid) return;
    await firestoreSyncService.pushRecipes(uid);
  },

  async afterFoodPrefChange() {
    const uid = getCurrentSyncUid();
    if (!uid) return;
    await firestoreSyncService.pushFoodPrefs(uid);
  },

  async pullForUser(uid: string) {
    return firestoreSyncService.pullUserData(uid);
  },

  async flushPending() {
    const uid = getCurrentSyncUid();
    if (!uid) return;
    await firestoreSyncService.flushDiaryPush(uid);
  },
};
