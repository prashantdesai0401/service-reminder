import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { Button } from '@/components/form';
import { ReminderForm } from '@/components/reminder-form';
import { reactivateReminder } from '@/db/logs';
import { deleteReminder, getReminder, updateReminder, type Reminder } from '@/db/reminders';
import { confirmDestructive } from '@/lib/confirm';
import { resyncNotifications } from '@/lib/notifications';

export default function EditReminderScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    getReminder(db, Number(id)).then(setReminder);
  }, [db, id]);

  if (!reminder) return null;

  return (
    <ReminderForm
      initial={reminder}
      submitLabel="Save changes"
      onSubmit={async (changes) => {
        await updateReminder(db, reminder.id, changes);
        await resyncNotifications(db);
        router.back();
      }}
      footer={
        <>
          {reminder.status === 'active' ? (
            <Button
              title="Mark as done"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/reminder/done/[id]',
                  params: { id: reminder.id, from: 'edit' },
                })
              }
            />
          ) : (
            <Button
              title="Put back on Upcoming"
              variant="secondary"
              onPress={async () => {
                await reactivateReminder(db, reminder.id);
                await resyncNotifications(db);
                router.back();
              }}
            />
          )}
          <Button
            title="Delete reminder"
            variant="danger"
            onPress={() =>
              confirmDestructive(
                'Delete reminder?',
                `Delete "${reminder.title}" and its service history? This can't be undone.`,
                async () => {
                  await deleteReminder(db, reminder.id);
                  await resyncNotifications(db);
                  router.back();
                },
              )
            }
          />
        </>
      }
    />
  );
}
