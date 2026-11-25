import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'service-reminder.db';

/**
 * Creates or upgrades the tables. SQLite keeps a number called `user_version`
 * inside the file; each block below runs once to move it up one version.
 * To change the tables later, add a new `if (version < N)` block — never edit an old one.
 */
export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('once', 'repeat')),
        due_date TEXT NOT NULL,
        repeat_every INTEGER,
        repeat_unit TEXT CHECK (repeat_unit IN ('days', 'weeks', 'months', 'years')),
        notify_days_before TEXT NOT NULL DEFAULT '[7,1,0]',
        prepaid INTEGER NOT NULL DEFAULT 0,
        amount_paid REAL,
        provider_name TEXT,
        provider_phone TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'archived')),
        notification_ids TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL
      );

      CREATE TABLE service_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reminder_id INTEGER NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
        done_on TEXT NOT NULL,
        cost REAL,
        notes TEXT
      );

      CREATE TABLE attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        log_id INTEGER REFERENCES service_logs(id) ON DELETE CASCADE,
        file_uri TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX idx_reminders_item ON reminders(item_id);
      CREATE INDEX idx_reminders_due ON reminders(status, due_date);
      CREATE INDEX idx_logs_reminder ON service_logs(reminder_id);
    `);
    version = 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }

  if (version < 2) {
    // Simple key/value preferences, e.g. what time of day reminders are sent.
    await db.execAsync(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    version = 2;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}
