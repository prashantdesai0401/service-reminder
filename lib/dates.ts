/**
 * Due dates are stored as plain calendar days, "YYYY-MM-DD", with no time or timezone,
 * so "due on 1 Sep" stays 1 Sep wherever the phone is.
 */

export type RepeatUnit = 'days' | 'weeks' | 'months' | 'years';

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Whole days from today to the date: 0 = today, negative = overdue. */
export function daysUntil(key: string): number {
  return Math.round((parseDateKey(key).getTime() - parseDateKey(todayKey()).getTime()) / DAY_MS);
}

/** Moves a date forward by an interval. Month steps clamp to the month's last day (31 Jan + 1 month = 28/29 Feb). */
export function addInterval(key: string, every: number, unit: RepeatUnit): string {
  const date = parseDateKey(key);
  if (unit === 'days' || unit === 'weeks') {
    date.setDate(date.getDate() + every * (unit === 'weeks' ? 7 : 1));
    return toDateKey(date);
  }
  const months = unit === 'years' ? every * 12 : every;
  const day = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return toDateKey(target);
}

export function formatDate(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Human label like "Due in 12 days", "Due today", "Overdue by 3 days". */
export function dueLabel(key: string): string {
  const days = daysUntil(key);
  if (days < 0) return `Overdue by ${plural(-days, 'day')}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 60) return `Due in ${plural(days, 'day')}`;
  return `Due in ${plural(Math.round(days / 30), 'month')}`;
}

export function repeatLabel(every: number, unit: RepeatUnit): string {
  const singular = unit.slice(0, -1);
  return every === 1 ? `Every ${singular}` : `Every ${every} ${unit}`;
}
