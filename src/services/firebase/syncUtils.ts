/** Pure helpers for incremental, offline-first cloud sync decisions. */

/** Firestore rejects `undefined` field values — omit them before setDoc/updateDoc. */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        result[key] = stripUndefinedDeep(val);
      }
    }
    return result as T;
  }

  return value;
}

export function shouldPullCollection(
  remoteUpdatedAt: string,
  localUpdatedAt: string,
): boolean {
  return remoteUpdatedAt > localUpdatedAt;
}

export function getDiaryMonthsToPull(
  remoteMonths: Record<string, string>,
  localMonths: Record<string, string>,
): string[] {
  return Object.entries(remoteMonths)
    .filter(([monthKey, remoteTs]) => shouldPullCollection(remoteTs, localMonths[monthKey] ?? ''))
    .map(([monthKey]) => monthKey);
}

export const OFFLINE_FIRST_SYNC_POLICY = {
  architecture: 'offline-first',
  auth: 'Google sign-in',
  localStore: 'IndexedDB (Dexie)',
  cloudStore: 'Firebase Firestore',
  syncedCollections: ['profile', 'customFoods', 'recipes', 'foodPrefs', 'diary'] as const,
  localOnlyCollections: ['seededFoods'] as const,
  pullStrategy: 'incremental on login — only changed bundles are downloaded',
  pushStrategy: 'write-through on save; diary batches debounced',
} as const;
