import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { resyncNotifications, setupNotificationChannel } from '@/lib/notifications';

/**
 * Renders nothing. Keeps scheduled notifications in step with the database whenever
 * the app opens or comes back to the foreground, and opens the right reminder when
 * the user taps a notification. Not used on web.
 */
export function NotificationBootstrap() {
  const db = useSQLiteContext();
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    setupNotificationChannel().then(() => resyncNotifications(db));
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resyncNotifications(db);
    });
    return () => sub.remove();
  }, [db]);

  useEffect(() => {
    const id = response?.notification.request.identifier;
    const reminderId = response?.notification.request.content.data?.reminderId;
    if (!id || handled.current === id || typeof reminderId !== 'number') return;
    handled.current = id;
    router.push({ pathname: '/reminder/[id]', params: { id: reminderId } });
  }, [response]);

  return null;
}
