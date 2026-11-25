import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A photo. It belongs either to an item directly (bill, warranty card) or to a
 * service log (the receipt for one service). `file_uri` holds the stored file name.
 */
export type Attachment = {
  id: number;
  item_id: number | null;
  log_id: number | null;
  file_uri: string;
  created_at: string;
};

/** An attachment plus, for receipts, which service and date it was for. */
export type AttachmentWithContext = Attachment & {
  reminder_title: string | null;
  done_on: string | null;
};

export async function addAttachment(
  db: SQLiteDatabase,
  owner: { itemId: number } | { logId: number },
  fileName: string
) {
  await db.runAsync(
    'INSERT INTO attachments (item_id, log_id, file_uri, created_at) VALUES (?, ?, ?, ?)',
    'itemId' in owner ? owner.itemId : null,
    'logId' in owner ? owner.logId : null,
    fileName,
    new Date().toISOString()
  );
}

/** Every photo for an item: its own photos plus receipts from its service history. */
export function listAttachmentsForItem(db: SQLiteDatabase, itemId: number) {
  return db.getAllAsync<AttachmentWithContext>(
    `SELECT a.*, r.title AS reminder_title, l.done_on AS done_on
     FROM attachments a
     LEFT JOIN service_logs l ON l.id = a.log_id
     LEFT JOIN reminders r ON r.id = l.reminder_id
     WHERE a.item_id = ? OR r.item_id = ?
     ORDER BY a.created_at DESC`,
    itemId,
    itemId
  );
}

export function getAttachment(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<AttachmentWithContext>(
    `SELECT a.*, r.title AS reminder_title, l.done_on AS done_on
     FROM attachments a
     LEFT JOIN service_logs l ON l.id = a.log_id
     LEFT JOIN reminders r ON r.id = l.reminder_id
     WHERE a.id = ?`,
    id
  );
}

export async function deleteAttachment(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM attachments WHERE id = ?', id);
}

/**
 * File names of photos that will disappear when an item / reminder / log is deleted,
 * so the files can be removed too (the database rows go automatically).
 */
export async function photoFilesFor(
  db: SQLiteDatabase,
  owner: { itemId: number } | { reminderId: number } | { logId: number }
) {
  let rows: { file_uri: string }[];
  if ('itemId' in owner) {
    rows = await listAttachmentsForItem(db, owner.itemId);
  } else if ('reminderId' in owner) {
    rows = await db.getAllAsync<{ file_uri: string }>(
      `SELECT a.file_uri FROM attachments a JOIN service_logs l ON l.id = a.log_id
       WHERE l.reminder_id = ?`,
      owner.reminderId
    );
  } else {
    rows = await db.getAllAsync<{ file_uri: string }>(
      'SELECT file_uri FROM attachments WHERE log_id = ?',
      owner.logId
    );
  }
  return rows.map((r) => r.file_uri);
}
