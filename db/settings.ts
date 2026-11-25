import type { SQLiteDatabase } from 'expo-sqlite';

/** Hour of the day (0–23) when reminder notifications are delivered. */
export const DEFAULT_REMINDER_HOUR = 9;

async function getSetting(db: SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value
  );
}

export async function getReminderHour(db: SQLiteDatabase) {
  const value = await getSetting(db, 'reminder_hour');
  return value === null ? DEFAULT_REMINDER_HOUR : Number(value);
}

export function setReminderHour(db: SQLiteDatabase, hour: number) {
  return setSetting(db, 'reminder_hour', String(hour));
}
