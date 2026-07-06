import { describe, expect, it } from 'vitest';
import type { Food } from '@/types/food.types.ts';
import { filterVisibleFoods, isFoodVisibleToUser } from './foodVisibility.ts';

const seeded = { id: '1', isCustom: false } as Food;
const approvedCommunity = {
  id: '2',
  isCustom: true,
  isCommunityFood: true,
  moderationStatus: 'approved',
  createdByUid: 'user-a',
} as Food;
const pendingOwn = {
  id: '3',
  isCustom: true,
  moderationStatus: 'pending',
  createdByUid: 'user-a',
} as Food;
const pendingOther = {
  id: '4',
  isCustom: true,
  moderationStatus: 'pending',
  createdByUid: 'user-b',
} as Food;

describe('isFoodVisibleToUser', () => {
  it('shows seeded and approved community foods to everyone', () => {
    expect(isFoodVisibleToUser(seeded, null)).toBe(true);
    expect(isFoodVisibleToUser(approvedCommunity, 'user-b')).toBe(true);
  });

  it('shows pending foods only to the creator', () => {
    expect(isFoodVisibleToUser(pendingOwn, 'user-a')).toBe(true);
    expect(isFoodVisibleToUser(pendingOwn, 'user-b')).toBe(false);
    expect(isFoodVisibleToUser(pendingOther, 'user-a')).toBe(false);
  });
});

describe('filterVisibleFoods', () => {
  it('filters out other users pending submissions', () => {
    expect(filterVisibleFoods([seeded, approvedCommunity, pendingOwn, pendingOther], 'user-a')).toEqual([
      seeded,
      approvedCommunity,
      pendingOwn,
    ]);
  });
});
