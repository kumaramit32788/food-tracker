import { db } from '@/services/db/dexieDb.ts';
import { CURRENT_SEED_VERSION } from '@/constants/db.ts';
import { seedService } from '@/services/db/seedService.ts';
import { getCurrentSyncUid } from '@/services/firebase/syncContext.ts';
import { firestoreSyncService } from '@/services/firebase/firestoreSyncService.ts';

export const dataService = {
  async exportAllData() {
    const [device, profile, foods, recipes, diaryDays, diaryEntries, meta, settings] =
      await Promise.all([
        db.device.toArray(),
        db.profile.toArray(),
        db.foods.toArray(),
        db.recipes.toArray(),
        db.diaryDays.toArray(),
        db.diaryEntries.toArray(),
        db.meta.toArray(),
        db.settings.toArray(),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      appVersion: '0.2.0',
      seedVersion: CURRENT_SEED_VERSION,
      device,
      profile,
      foods,
      recipes,
      diaryDays,
      diaryEntries,
      meta,
      settings,
    };
  },

  async downloadExport() {
    const payload = await this.exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutritrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async deleteAllUserData() {
    const uid = getCurrentSyncUid();
    if (uid) {
      await firestoreSyncService.deleteUserCloudData(uid);
    }

    const customFoods = await db.foods.filter((food) => food.isCustom && !food.isCommunityFood).toArray();
    await Promise.all([
      db.diaryEntries.clear(),
      db.diaryDays.clear(),
      db.recipes.clear(),
      db.foods.bulkDelete(customFoods.map((food) => food.id)),
      db.profile.clear(),
      db.device.clear(),
      db.settings.clear(),
    ]);
    await seedService.initialize();
  },
};
