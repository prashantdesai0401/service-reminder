import type { SQLiteDatabase } from 'expo-sqlite';

import type { Reminder } from '@/db/reminders';
import { addInterval } from '@/lib/dates';

export type ServiceLog = {
  id: number;
  reminder_id: number;
  done_on: string;
  cost: number | null;
  notes: string | null;
};

/** A log joined with its reminder's title, for an item's history list. */
export type ServiceLogWithTitle = ServiceLog & { reminder_title: string };

export type DoneInput = {
  done_on: string;
  cost: number | null;
  notes: string | null;
};

/** The date a repeating reminder moves to once it's done: the done date plus the interval. */
export function nextDueAfter(reminder: Reminder, doneOn: string) {
  if (reminder.type !== 'repeat' || !reminder.repeat_every || !reminder.repeat_unit) return null;
  return addInterval(doneOn, reminder.repeat_every, reminder.repeat_unit);
}

/**
 * Records that a service was done.
 * - Repeating reminder: moves to its next due date (and the prepaid flag is cleared,
 *   because the next one hasn't been paid for yet).
 * - One-time reminder: marked done, so it leaves the Upcoming list.
 */
export async function markDone(db: SQLiteDatabase, reminder: Reminder, done: DoneInput) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO service_logs (reminder_id, done_on, cost, notes) VALUES (?, ?, ?, ?)',
      reminder.id,
      done.done_on,
      done.cost,
      done.notes?.trim() || null
    );

    const next = nextDueAfter(reminder, done.done_on);
    if (next) {
      await db.runAsync(
        'UPDATE reminders SET due_date = ?, prepaid = 0, amount_paid = NULL WHERE id = ?',
        next,
        reminder.id
      );
    } else {
      await db.runAsync("UPDATE reminders SET status = 'done' WHERE id = ?", reminder.id);
    }
  });
}

/** Puts a done one-time reminder back on the Upcoming list. */
export async function reactivateReminder(db: SQLiteDatabase, reminderId: number) {
  await db.runAsync("UPDATE reminders SET status = 'active' WHERE id = ?", reminderId);
}

export function listLogsForItem(db: SQLiteDatabase, itemId: number) {
  return db.getAllAsync<ServiceLogWithTitle>(
    `SELECT l.*, r.title AS reminder_title
     FROM service_logs l JOIN reminders r ON r.id = l.reminder_id
     WHERE r.item_id = ?
     ORDER BY l.done_on DESC, l.id DESC`,
    itemId
  );
}

export async function deleteLog(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM service_logs WHERE id = ?', id);
}
