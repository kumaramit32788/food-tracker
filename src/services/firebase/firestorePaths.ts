/** Firestore paths — bundled docs to minimize reads (1 doc per collection/bundle). */
export const firestorePaths = {
  userRoot: (uid: string) => `users/${uid}`,
  profile: (uid: string) => `users/${uid}/profile/data`,
  accountMeta: (uid: string) => `users/${uid}/account/meta`,
  syncMeta: (uid: string) => `users/${uid}/sync/meta`,
  bundle: {
    customFoods: (uid: string) => `users/${uid}/bundles/customFoods`,
    recipes: (uid: string) => `users/${uid}/bundles/recipes`,
    foodPrefs: (uid: string) => `users/${uid}/bundles/foodPrefs`,
    diaryMonth: (uid: string, monthKey: string) => `users/${uid}/bundles/diary-${monthKey}`,
  },
  community: {
    meta: 'community/meta',
    approvedFoods: 'community/approvedFoods',
    submission: (foodId: string) => `communitySubmissions/${foodId}`,
    pendingQuery: 'communitySubmissions',
  },
} as const;

export function getMonthKey(date: string): string {
  return date.slice(0, 7);
}
