import type { SQLiteDatabase } from 'expo-sqlite';

import type { CategoryId } from '@/constants/categories';

export type Item = {
  id: number;
  name: string;
  category: CategoryId;
  notes: string | null;
  created_at: string;
};

export type NewItem = {
  name: string;
  category: CategoryId;
  notes?: string;
};

/** An item plus its soonest active reminder (if any), for the Items list. */
export type ItemWithNextDue = Item & { next_due: string | null; next_title: string | null };

export function listItems(db: SQLiteDatabase) {
  return db.getAllAsync<ItemWithNextDue>(
    `SELECT i.*,
       (SELECT r.due_date FROM reminders r WHERE r.item_id = i.id AND r.status = 'active'
        ORDER BY r.due_date LIMIT 1) AS next_due,
       (SELECT r.title FROM reminders r WHERE r.item_id = i.id AND r.status = 'active'
        ORDER BY r.due_date LIMIT 1) AS next_title
     FROM items i
     ORDER BY i.name COLLATE NOCASE`
  );
}

export function getItem(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Item>('SELECT * FROM items WHERE id = ?', id);
}

export async function createItem(db: SQLiteDatabase, item: NewItem) {
  const result = await db.runAsync(
    'INSERT INTO items (name, category, notes, created_at) VALUES (?, ?, ?, ?)',
    item.name.trim(),
    item.category,
    item.notes?.trim() || null,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function updateItem(db: SQLiteDatabase, id: number, item: NewItem) {
  await db.runAsync(
    'UPDATE items SET name = ?, category = ?, notes = ? WHERE id = ?',
    item.name.trim(),
    item.category,
    item.notes?.trim() || null,
    id
  );
}

/** Deletes the item and (through ON DELETE CASCADE) its reminders, logs and photos records. */
export async function deleteItem(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}
