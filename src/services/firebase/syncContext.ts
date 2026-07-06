/** Current signed-in Firebase UID — set by AuthProvider. */
let currentSyncUid: string | null = null;

export function setCurrentSyncUid(uid: string | null) {
  currentSyncUid = uid;
}

export function getCurrentSyncUid(): string | null {
  return currentSyncUid;
}
