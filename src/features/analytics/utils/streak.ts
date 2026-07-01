import { enumerateDateKeys, getLocalDateKey } from '@/utils/date.ts';

export function calculateLoggingStreak(loggedDates: Set<string>, upToDate = getLocalDateKey()): number {
  let streak = 0;
  const cursor = new Date(
    Number(upToDate.slice(0, 4)),
    Number(upToDate.slice(5, 7)) - 1,
    Number(upToDate.slice(8, 10)),
  );

  while (true) {
    const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (!loggedDates.has(dateKey)) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function collectLoggedDates(entries: { date: string }[]): Set<string> {
  return new Set(entries.map((entry) => entry.date));
}

export function countLoggedDaysInRange(
  loggedDates: Set<string>,
  startDate: string,
  endDate: string,
): number {
  return enumerateDateKeys(startDate, endDate).filter((date) => loggedDates.has(date)).length;
}
