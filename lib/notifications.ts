import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { formatMoney } from '@/constants/money';
import { listUpcoming, type ReminderWithItem } from '@/db/reminders';
import { getReminderHour } from '@/db/settings';
import { formatDate, parseDateKey } from '@/lib/dates';

/**
 * How notifications work in this app:
 * every time something changes (and every time the app opens) we cancel ALL scheduled
 * notifications and schedule them again from the database. That keeps the phone in step
 * with the data, even after a restart, an edit, or a deleted item.
 */

const CHANNEL_ID = 'reminders';

/** Extra nudges after the due date if it still isn't marked done: 1, 3 and 7 days late. */
const OVERDUE_NUDGE_DAYS = [1, 3, 7];

const supported = Platform.OS !== 'web';

// Show notifications even while the app is open.
if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Android needs a "channel" — it's what the user sees under App info → Notifications. */
export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Service reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPermission(): Promise<PermissionState> {
  if (!supported) return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Shows the system "Allow notifications?" prompt if it hasn't been answered yet. */
export async function requestPermission(): Promise<PermissionState> {
  if (!supported) return 'unsupported';
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted' || !current.canAskAgain) return current.status;
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

function notificationText(r: ReminderWithItem, daysBefore: number) {
  const prepaidNote =
    r.prepaid && daysBefore >= 0
      ? ` You've already paid${r.amount_paid ? ` ${formatMoney(r.amount_paid)}` : ''} — don't let it go to waste.`
      : '';

  if (daysBefore > 1) {
    return { title: `${r.title} due in ${daysBefore} days`, body: `${r.item_name}.${prepaidNote}` };
  }
  if (daysBefore === 1) {
    return { title: `${r.title} due tomorrow`, body: `${r.item_name}.${prepaidNote}` };
  }
  if (daysBefore === 0) {
    return { title: `Due today: ${r.title}`, body: `${r.item_name}.${prepaidNote}` };
  }
  return {
    title: `Overdue: ${r.title}`,
    body: `${r.item_name} — was due on ${formatDate(r.due_date)}. Tap to update it.`,
  };
}

/** When a notification should fire: `daysBefore` days before the due date, at the chosen hour. */
function fireDate(dueDate: string, daysBefore: number, hour: number) {
  const date = parseDateKey(dueDate);
  date.setDate(date.getDate() - daysBefore);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function scheduleAll(db: SQLiteDatabase) {
  // Cancel only reminder notifications, so a pending test notification survives.
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of existing) {
    if (n.content.data?.reminderId != null) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
  if ((await getPermission()) !== 'granted') return;

  const hour = await getReminderHour(db);
  const now = Date.now();
  const reminders = await listUpcoming(db);

  for (const r of reminders) {
    const offsets = [...r.notify_days_before, ...OVERDUE_NUDGE_DAYS.map((d) => -d)];
    for (const daysBefore of offsets) {
      const date = fireDate(r.due_date, daysBefore, hour);
      if (date.getTime() <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { ...notificationText(r, daysBefore), data: { reminderId: r.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
      });
    }
  }
}

let queue: Promise<void> = Promise.resolve();

/**
 * Rebuilds every scheduled notification from the database. Calls are run one after
 * another so two quick saves can't schedule duplicates.
 */
export function resyncNotifications(db: SQLiteDatabase) {
  if (!supported) return Promise.resolve();
  queue = queue.then(() => scheduleAll(db)).catch((e) => console.warn('Notification sync failed', e));
  return queue;
}

export async function countScheduled() {
  if (!supported) return 0;
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test reminder',
      body: 'Notifications are working. Your service reminders will look like this.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: CHANNEL_ID,
    },
  });
}
