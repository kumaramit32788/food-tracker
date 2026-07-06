import { describe, expect, it } from 'vitest';
import {
  getDiaryMonthsToPull,
  OFFLINE_FIRST_SYNC_POLICY,
  shouldPullCollection,
  stripUndefinedDeep,
} from './syncUtils.ts';

describe('shouldPullCollection', () => {
  it('pulls when remote is newer than local', () => {
    expect(shouldPullCollection('2026-07-05T10:00:00.000Z', '2026-07-05T09:00:00.000Z')).toBe(true);
  });

  it('skips when timestamps match', () => {
    expect(shouldPullCollection('2026-07-05T10:00:00.000Z', '2026-07-05T10:00:00.000Z')).toBe(
      false,
    );
  });

  it('skips when local is newer than remote', () => {
    expect(shouldPullCollection('2026-07-05T09:00:00.000Z', '2026-07-05T10:00:00.000Z')).toBe(
      false,
    );
  });

  it('pulls when local timestamp is missing', () => {
    expect(shouldPullCollection('2026-07-05T10:00:00.000Z', '')).toBe(true);
  });
});

describe('getDiaryMonthsToPull', () => {
  it('returns only months with newer remote data', () => {
    const remote = {
      '2026-06': '2026-06-30T12:00:00.000Z',
      '2026-07': '2026-07-05T12:00:00.000Z',
    };
    const local = {
      '2026-06': '2026-06-30T12:00:00.000Z',
      '2026-07': '2026-07-01T12:00:00.000Z',
    };

    expect(getDiaryMonthsToPull(remote, local)).toEqual(['2026-07']);
  });

  it('returns empty when everything is up to date', () => {
    const remote = { '2026-07': '2026-07-05T12:00:00.000Z' };
    const local = { '2026-07': '2026-07-05T12:00:00.000Z' };

    expect(getDiaryMonthsToPull(remote, local)).toEqual([]);
  });
});

describe('stripUndefinedDeep', () => {
  it('removes undefined fields from nested objects', () => {
    expect(
      stripUndefinedDeep({
        name: 'Rice',
        subcategory: undefined,
        brand: undefined,
        tags: ['grain'],
        nested: { a: 1, b: undefined },
      }),
    ).toEqual({
      name: 'Rice',
      tags: ['grain'],
      nested: { a: 1 },
    });
  });
});

describe('OFFLINE_FIRST_SYNC_POLICY', () => {
  it('documents offline-first architecture and synced collections', () => {
    expect(OFFLINE_FIRST_SYNC_POLICY.architecture).toBe('offline-first');
    expect(OFFLINE_FIRST_SYNC_POLICY.syncedCollections).toContain('profile');
    expect(OFFLINE_FIRST_SYNC_POLICY.syncedCollections).toContain('diary');
    expect(OFFLINE_FIRST_SYNC_POLICY.localOnlyCollections).toContain('seededFoods');
    expect(OFFLINE_FIRST_SYNC_POLICY.pullStrategy).toMatch(/incremental/i);
  });
});
