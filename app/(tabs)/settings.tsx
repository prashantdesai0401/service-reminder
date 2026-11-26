import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Chip } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getReminderHour, setReminderHour } from '@/db/settings';
import {
  countScheduled,
  getPermission,
  requestPermission,
  resyncNotifications,
  sendTestNotification,
  type PermissionState,
} from '@/lib/notifications';

const HOURS = [
  { hour: 8, label: '8 AM' },
  { hour: 9, label: '9 AM' },
  { hour: 12, label: '12 PM' },
  { hour: 18, label: '6 PM' },
  { hour: 20, label: '8 PM' },
];

const PERMISSION_TEXT: Record<PermissionState, string> = {
  granted: 'On — you will get reminders.',
  denied: 'Off — reminders are blocked. Turn them on in your phone settings.',
  undetermined: 'Not set up yet.',
  unsupported: 'Notifications only work in the phone app, not in a web browser.',
};

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [scheduled, setScheduled] = useState(0);
  const [testSent, setTestSent] = useState(false);

  const refresh = useCallback(async () => {
    setPermission(await getPermission());
    setHour(await getReminderHour(db));
    setScheduled(await countScheduled());
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const turnOn = async () => {
    const result = await requestPermission();
    if (result === 'denied') Linking.openSettings();
    await resyncNotifications(db);
    refresh();
  };

  const chooseHour = async (h: number) => {
    setHour(h);
    await setReminderHour(db, h);
    await resyncNotifications(db);
    refresh();
  };

  const test = async () => {
    await sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 10000);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Settings</ThemedText>

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Notifications</ThemedText>
            {permission && (
              <ThemedText style={permission === 'granted' ? styles.muted : styles.danger}>
                {PERMISSION_TEXT[permission]}
              </ThemedText>
            )}
            {permission === 'granted' && (
              <ThemedText style={styles.muted}>
                {scheduled === 1
                  ? '1 reminder notification'
                  : `${scheduled} reminder notifications`}{' '}
                scheduled.
              </ThemedText>
            )}
            {(permission === 'undetermined' || permission === 'denied') && (
              <Button
                title={permission === 'denied' ? 'Open phone settings' : 'Turn on notifications'}
                onPress={turnOn}
              />
            )}
            {permission === 'granted' && (
              <Button
                title={
                  testSent ? 'Sent — it will arrive in 10 seconds' : 'Send a test notification'
                }
                variant="secondary"
                disabled={testSent}
                onPress={test}
              />
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Remind me at</ThemedText>
            <ThemedText style={styles.muted}>What time of day reminders arrive.</ThemedText>
            <View style={styles.chips}>
              {HOURS.map((h) => (
                <Chip
                  key={h.hour}
                  label={h.label}
                  selected={hour === h.hour}
                  onPress={() => chooseHour(h.hour)}
                />
              ))}
            </View>
          </View>

          <ThemedText style={[styles.footnote, styles.muted]}>
            If a service is still not marked done, you&apos;ll get extra nudges 1, 3 and 7 days
            after it was due.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  content: { padding: theme.space(5), paddingTop: theme.space(4), gap: theme.space(4) },
  section: {
    borderRadius: theme.radius.xl,
    padding: theme.space(4),
    gap: theme.space(2.5),
    backgroundColor: theme.colors.card,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2) },
  footnote: { fontSize: theme.type.label.fontSize },
  muted: { color: theme.colors.muted },
  danger: { color: theme.colors.danger },
}));
