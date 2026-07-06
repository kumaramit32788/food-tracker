import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type DocumentReference,
} from 'firebase/firestore';
import { userAccountService } from '@/services/firebase/userAccountService.ts';
import { db } from '@/services/db/dexieDb.ts';
import { foodRepository } from '@/services/db/repositories/foodRepository.ts';
import { getFirestoreDb } from '@/services/firebase/firebaseApp.ts';
import { firestorePaths } from '@/services/firebase/firestorePaths.ts';
import { stripUndefinedDeep } from '@/services/firebase/syncUtils.ts';
import type { Food, FoodModerationStatus } from '@/types/food.types.ts';
import { isPersonalCustomFood } from '@/utils/foodVisibility.ts';

export interface CommunityMeta {
  approvedUpdatedAt: string;
  updatedAt: string;
}

export interface ApprovedFoodsBundle {
  items: Food[];
  updatedAt: string;
}

export interface CommunitySubmission extends Food {
  moderationStatus: FoodModerationStatus;
  createdByUid: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByUid?: string;
}

const LOCAL_COMMUNITY_META_KEY = 'community-foods-meta';

function nowIso(): string {
  return new Date().toISOString();
}

async function getDocData<T>(ref: DocumentReference): Promise<T | null> {
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as T) : null;
}

async function getLocalCommunityUpdatedAt(): Promise<string> {
  const record = await db.meta.get(LOCAL_COMMUNITY_META_KEY);
  if (!record?.value) return '';
  try {
    const parsed = JSON.parse(record.value) as { approvedUpdatedAt?: string };
    return parsed.approvedUpdatedAt ?? '';
  } catch {
    return '';
  }
}

async function saveLocalCommunityUpdatedAt(approvedUpdatedAt: string): Promise<void> {
  await db.meta.put({
    key: LOCAL_COMMUNITY_META_KEY,
    value: JSON.stringify({ approvedUpdatedAt }),
  });
}

export const communityFoodService = {
  async submitPendingFood(food: Food, uid: string): Promise<void> {
    if (!food.isCustom || food.isCommunityFood || food.moderationStatus === 'approved') {
      return;
    }

    const fs = getFirestoreDb();
    const submission: CommunitySubmission = {
      ...food,
      moderationStatus: food.moderationStatus ?? 'pending',
      createdByUid: uid,
      submittedAt: food.createdAt,
    };

    await setDoc(
      doc(fs, firestorePaths.community.submission(food.id)),
      stripUndefinedDeep(submission),
    );
  },

  async submitPendingFoods(uid: string): Promise<number> {
    const personalFoods = (await foodRepository.getAll()).filter(
      (food) =>
        isPersonalCustomFood(food) &&
        food.createdByUid === uid &&
        (food.moderationStatus === 'pending' || !food.moderationStatus),
    );

    await Promise.all(personalFoods.map((food) => this.submitPendingFood(food, uid)));
    return personalFoods.length;
  },

  async pullApprovedFoods(force = false): Promise<{ readsUsed: number; pulled: boolean }> {
    const fs = getFirestoreDb();
    let readsUsed = 0;

    const remoteMeta =
      (await getDocData<CommunityMeta>(doc(fs, firestorePaths.community.meta))) ??
      ({ approvedUpdatedAt: '', updatedAt: '' } satisfies CommunityMeta);
    readsUsed += 1;

    const localUpdatedAt = await getLocalCommunityUpdatedAt();
    if (!force && remoteMeta.approvedUpdatedAt && remoteMeta.approvedUpdatedAt <= localUpdatedAt) {
      return { readsUsed, pulled: false };
    }

    const bundle =
      (await getDocData<ApprovedFoodsBundle>(doc(fs, firestorePaths.community.approvedFoods))) ??
      ({ items: [], updatedAt: '' } satisfies ApprovedFoodsBundle);
    readsUsed += 1;

    await this.applyApprovedFoods(bundle.items);
    await saveLocalCommunityUpdatedAt(remoteMeta.approvedUpdatedAt || bundle.updatedAt);

    return { readsUsed, pulled: true };
  },

  async applyApprovedFoods(items: Food[]): Promise<void> {
    const existing = await foodRepository.getAll();
    for (const food of existing) {
      if (food.isCommunityFood) {
        await foodRepository.delete(food.id);
      }
    }

    const approved = items.map((food) => ({
      ...food,
      isCustom: true,
      isCommunityFood: true,
      moderationStatus: 'approved' as const,
    }));

    if (approved.length > 0) {
      await foodRepository.bulkPut(approved);
    }
  },

  async listPendingSubmissions(_adminUid: string): Promise<CommunitySubmission[]> {
    const fs = getFirestoreDb();
    const q = query(
      collection(fs, firestorePaths.community.pendingQuery),
      where('moderationStatus', '==', 'pending'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CommunitySubmission);
  },

  async reviewSubmission(
    foodId: string,
    adminUid: string,
    decision: 'approved' | 'rejected',
  ): Promise<void> {
    if (!(await userAccountService.isAdmin(adminUid))) {
      throw new Error('Admin access required');
    }

    const fs = getFirestoreDb();
    const submissionRef = doc(fs, firestorePaths.community.submission(foodId));
    const submission = await getDocData<CommunitySubmission>(submissionRef);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const reviewedAt = nowIso();
    const reviewedSubmission: CommunitySubmission = {
      ...submission,
      moderationStatus: decision,
      reviewedAt,
      reviewedByUid: adminUid,
    };

    await setDoc(submissionRef, stripUndefinedDeep(reviewedSubmission));

    if (decision === 'approved') {
      const bundle =
        (await getDocData<ApprovedFoodsBundle>(doc(fs, firestorePaths.community.approvedFoods))) ??
        ({ items: [], updatedAt: '' } satisfies ApprovedFoodsBundle);

      const withoutDuplicate = bundle.items.filter((item) => item.id !== foodId);
      const approvedFood: Food = {
        ...submission,
        isCustom: true,
        isCommunityFood: true,
        moderationStatus: 'approved',
        updatedAt: reviewedAt,
      };

      const updatedItems = [...withoutDuplicate, approvedFood];
      await setDoc(
        doc(fs, firestorePaths.community.approvedFoods),
        stripUndefinedDeep({
          items: updatedItems,
          updatedAt: reviewedAt,
        } satisfies ApprovedFoodsBundle),
      );

      await setDoc(
        doc(fs, firestorePaths.community.meta),
        {
          approvedUpdatedAt: reviewedAt,
          updatedAt: reviewedAt,
        } satisfies CommunityMeta,
        { merge: true },
      );

      await this.applyApprovedFoods(updatedItems);
      await saveLocalCommunityUpdatedAt(reviewedAt);
    }

    const local = await foodRepository.getById(foodId);
    if (local && local.createdByUid === submission.createdByUid) {
      if (decision === 'approved') {
        await foodRepository.update(foodId, {
          isCommunityFood: true,
          moderationStatus: 'approved',
          updatedAt: reviewedAt,
        });
      } else {
        await foodRepository.update(foodId, {
          moderationStatus: 'rejected',
          updatedAt: reviewedAt,
        });
      }
    }
  },
};
