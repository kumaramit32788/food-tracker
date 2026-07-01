/** Local calendar date as YYYY-MM-DD (not UTC). */
export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = parseDateKey(value);
  return getLocalDateKey(date) === value;
}

export function isToday(dateKey: string): boolean {
  return dateKey === getLocalDateKey();
}

export function isFutureDateKey(dateKey: string): boolean {
  return dateKey > getLocalDateKey();
}

export function formatLocalDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatDisplayDate(dateKey: string) {
  return formatLocalDate(parseDateKey(dateKey));
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getDateKey(date: Date): string {
  return getLocalDateKey(date);
}

export function getMonthRangeFor(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: getDateKey(start), end: getDateKey(end) };
}

export function getWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return { start: getDateKey(start), end: getDateKey(end) };
}

export function getMonthRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start: getDateKey(start), end: getDateKey(end) };
}

export function getLastNDaysRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return { start: getDateKey(start), end: getDateKey(end) };
}

export function enumerateDateKeys(startDate: string, endDate: string): string[] {
  const keys: string[] = [];
  const current = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  while (current <= end) {
    keys.push(getDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return keys;
}

export function formatShortWeekday(dateKey: string) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(parseDateKey(dateKey));
}

export function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(
    parseDateKey(dateKey),
  );
}
