import type { SQLiteDatabase } from 'expo-sqlite';

import type { CategoryId } from '@/constants/categories';
import type { RepeatUnit } from '@/lib/dates';

export type ReminderType = 'once' | 'repeat';
export type ReminderStatus = 'active' | 'done' | 'archived';

/** A reminder as the app uses it (lists already parsed, booleans as booleans). */
export type Reminder = {
  id: number;
  item_id: number;
  title: string;
  type: ReminderType;
  due_date: string;
  repeat_every: number | null;
  repeat_unit: RepeatUnit | null;
  notify_days_before: number[];
  prepaid: boolean;
  amount_paid: number | null;
  provider_name: string | null;
  provider_phone: string | null;
  status: ReminderStatus;
  notification_ids: string[];
  created_at: string;
};

/** A reminder joined with the item it belongs to, for the Upcoming list. */
export type ReminderWithItem = Reminder & { item_name: string; item_category: CategoryId };

/** What the add/edit form produces. */
export type ReminderInput = {
  title: string;
  type: ReminderType;
  due_date: string;
  repeat_every: number | null;
  repeat_unit: RepeatUnit | null;
  notify_days_before: number[];
  prepaid: boolean;
  amount_paid: number | null;
  provider_name: string | null;
  provider_phone: string | null;
};

type Row = Omit<Reminder, 'notify_days_before' | 'prepaid' | 'notification_ids'> & {
  notify_days_before: string;
  prepaid: number;
  notification_ids: string;
};

function fromRow<T extends Row>(row: T) {
  return {
    ...row,
    notify_days_before: JSON.parse(row.notify_days_before) as number[],
    prepaid: row.prepaid === 1,
    notification_ids: JSON.parse(row.notification_ids) as string[],
  };
}

function clean(s: string | null) {
  return s?.trim() || null;
}

export async function listRemindersForItem(db: SQLiteDatabase, itemId: number) {
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM reminders WHERE item_id = ? AND status != 'archived'
     ORDER BY status = 'done', due_date`,
    itemId
  );
  return rows.map(fromRow) as Reminder[];
}

/** All active reminders, soonest first, with their item's name. */
export async function listUpcoming(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<Row & { item_name: string; item_category: CategoryId }>(
    `SELECT r.*, i.name AS item_name, i.category AS item_category
     FROM reminders r JOIN items i ON i.id = r.item_id
     WHERE r.status = 'active'
     ORDER BY r.due_date, r.id`
  );
  return rows.map(fromRow) as ReminderWithItem[];
}

export async function getReminder(db: SQLiteDatabase, id: number) {
  const row = await db.getFirstAsync<Row>('SELECT * FROM reminders WHERE id = ?', id);
  return row ? (fromRow(row) as Reminder) : null;
}

export async function createReminder(db: SQLiteDatabase, itemId: number, r: ReminderInput) {
  const result = await db.runAsync(
    `INSERT INTO reminders (item_id, title, type, due_date, repeat_every, repeat_unit,
       notify_days_before, prepaid, amount_paid, provider_name, provider_phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    itemId,
    r.title.trim(),
    r.type,
    r.due_date,
    r.type === 'repeat' ? r.repeat_every : null,
    r.type === 'repeat' ? r.repeat_unit : null,
    JSON.stringify(r.notify_days_before),
    r.prepaid ? 1 : 0,
    r.prepaid ? r.amount_paid : null,
    clean(r.provider_name),
    clean(r.provider_phone),
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function updateReminder(db: SQLiteDatabase, id: number, r: ReminderInput) {
  await db.runAsync(
    `UPDATE reminders SET title = ?, type = ?, due_date = ?, repeat_every = ?, repeat_unit = ?,
       notify_days_before = ?, prepaid = ?, amount_paid = ?, provider_name = ?, provider_phone = ?
     WHERE id = ?`,
    r.title.trim(),
    r.type,
    r.due_date,
    r.type === 'repeat' ? r.repeat_every : null,
    r.type === 'repeat' ? r.repeat_unit : null,
    JSON.stringify(r.notify_days_before),
    r.prepaid ? 1 : 0,
    r.prepaid ? r.amount_paid : null,
    clean(r.provider_name),
    clean(r.provider_phone),
    id
  );
}

export async function deleteReminder(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
}
