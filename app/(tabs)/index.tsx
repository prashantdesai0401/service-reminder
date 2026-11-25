import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderCard } from '@/components/reminder-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { listUpcoming, type ReminderWithItem } from '@/db/reminders';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysUntil } from '@/lib/dates';

/** Which heading a reminder goes under, by days until it's due. */
const GROUPS = [
  { title: 'Overdue', test: (d: number) => d < 0 },
  { title: 'Due this week', test: (d: number) => d >= 0 && d <= 7 },
  { title: 'This month', test: (d: number) => d > 7 && d <= 31 },
  { title: 'Later', test: (d: number) => d > 31 },
];

export default function UpcomingScreen() {
  const db = useSQLiteContext();
  const [reminders, setReminders] = useState<ReminderWithItem[] | null>(null);
  const muted = useThemeColor({}, 'muted');
  const danger = useThemeColor({}, 'danger');

  useFocusEffect(
    useCallback(() => {
      listUpcoming(db).then(setReminders);
    }, [db])
  );

  const sections = useMemo(
    () =>
      GROUPS.map((g) => ({
        title: g.title,
        data: (reminders ?? []).filter((r) => g.test(daysUntil(r.due_date))),
      })).filter((s) => s.data.length > 0),
    [reminders]
  );

  const overdue = sections.find((s) => s.title === 'Overdue')?.data.length ?? 0;
  const thisWeek = sections.find((s) => s.title === 'Due this week')?.data.length ?? 0;

  let summary = 'Nothing due this week.';
  if (overdue > 0) summary = `${overdue} overdue — take care of these first.`;
  else if (thisWeek > 0) summary = `${thisWeek} due this week.`;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title">Upcoming</ThemedText>
          {reminders && reminders.length > 0 && (
            <ThemedText style={{ color: overdue > 0 ? danger : muted }}>{summary}</ThemedText>
          )}
        </View>

        {reminders && reminders.length === 0 ? (
          <ThemedText style={[styles.empty, { color: muted }]}>
            No services due yet. Go to Items, open your bike or inverter, and add a reminder.
          </ThemedText>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <ThemedText
                type="defaultSemiBold"
                style={[styles.sectionHeader, { color: section.title === 'Overdue' ? danger : muted }]}>
                {section.title}
              </ThemedText>
            )}
            renderItem={({ item }) => <ReminderCard reminder={item} showItem />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 4 },
  empty: { padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 8 },
  sectionHeader: { marginTop: 16, marginBottom: 4, fontSize: 14, textTransform: 'uppercase' },
});
