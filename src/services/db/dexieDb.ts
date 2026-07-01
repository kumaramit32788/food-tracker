import Dexie, { type Table } from 'dexie';
import { DB_NAME } from '@/constants/db.ts';
import type { DiaryDay, DiaryEntry } from '@/types/diary.types.ts';
import type { DeviceUserRecord, ProfileRecord } from '@/types/db.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { Recipe } from '@/types/recipe.types.ts';

export interface SettingRecord {
  id: string;
  value: string;
}

export interface MetaRecord {
  key: string;
  value: string;
}

export class NutriTrackDatabase extends Dexie {
  device!: Table<DeviceUserRecord, string>;
  profile!: Table<ProfileRecord, string>;
  foods!: Table<Food, string>;
  diaryDays!: Table<DiaryDay, string>;
  diaryEntries!: Table<DiaryEntry, string>;
  recipes!: Table<Recipe, string>;
  settings!: Table<SettingRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      device: 'id',
      profile: 'id',
      foods: 'id, name, category, subcategory, isCustom, isFavorite, isVegetarian, lastUsedAt, searchText, *aliases, *tags',
      diaryDays: 'id, date',
      diaryEntries: 'id, diaryDayId, date, mealType, foodId, recipeId, loggedAt',
      settings: 'id',
      meta: 'key',
    });

    this.version(2).stores({
      recipes: 'id, name, category, isFavorite, createdAt',
    });
  }
}

export const db = new NutriTrackDatabase();
