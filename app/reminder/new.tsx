import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ReminderForm } from '@/components/reminder-form';
import { createReminder } from '@/db/reminders';
import { requestPermission, resyncNotifications } from '@/lib/notifications';

/** Opened from an item's page as /reminder/new?itemId=3 */
export default function NewReminderScreen() {
  const db = useSQLiteContext();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  return (
    <ReminderForm
      submitLabel="Save reminder"
      onSubmit={async (reminder) => {
        await createReminder(db, Number(itemId), reminder);
        // Ask for notification permission at the moment it clearly matters.
        await requestPermission();
        await resyncNotifications(db);
        router.back();
      }}
    />
  );
}
