import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/form';
import { Icon } from '@/components/icon';
import { ReminderCard } from '@/components/reminder-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatMoney } from '@/constants/money';
import { listUpcoming, type ReminderWithItem } from '@/db/reminders';
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

  useFocusEffect(
    useCallback(() => {
      listUpcoming(db).then(setReminders);
    }, [db]),
  );

  const sections = useMemo(
    () =>
      GROUPS.map((g) => ({
        title: g.title,
        data: (reminders ?? []).filter((r) => g.test(daysUntil(r.due_date))),
      })).filter((s) => s.data.length > 0),
    [reminders],
  );

  const overdue = sections.find((s) => s.title === 'Overdue')?.data.length ?? 0;
  const thisWeek = sections.find((s) => s.title === 'Due this week')?.data.length ?? 0;

  // Money already paid for services coming up soon — the thing this app exists to protect.
  const prepaidSoon = (reminders ?? []).filter((r) => r.prepaid && daysUntil(r.due_date) <= 30);
  const prepaidTotal = prepaidSoon.reduce((sum, r) => sum + (r.amount_paid ?? 0), 0);

  let summary = 'Nothing due this week.';
  if (overdue > 0) summary = `${overdue} overdue — take care of these first.`;
  else if (thisWeek > 0) summary = `${thisWeek} due this week.`;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title">Upcoming</ThemedText>
          {reminders && reminders.length > 0 && (
            <ThemedText style={overdue > 0 ? styles.danger : styles.muted}>{summary}</ThemedText>
          )}
        </View>

        {prepaidSoon.length > 0 && (
          <View style={styles.prepaid}>
            <Icon name="savings" size={26} color="tint" />
            <ThemedText style={styles.prepaidText}>
              {prepaidTotal > 0 ? `${formatMoney(prepaidTotal)} already paid` : 'Already paid'} for{' '}
              {prepaidSoon.length === 1 ? 'a service' : `${prepaidSoon.length} services`} due within
              30 days. Don&apos;t let it go to waste.
            </ThemedText>
          </View>
        )}

        {reminders && reminders.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="notifications-none" size={48} color="muted" />
            <ThemedText type="defaultSemiBold">No services coming up</ThemedText>
            <ThemedText style={[styles.emptyText, styles.muted]}>
              Add the things you need to look after, like your bike or inverter, and when they need
              servicing. You&apos;ll be reminded before it&apos;s due.
            </ThemedText>
            <View style={styles.emptyButton}>
              <Button title="Add your first item" onPress={() => router.push('/item/new')} />
            </View>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.sectionHeader,
                  section.title === 'Overdue' ? styles.danger : styles.muted,
                ]}>
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

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: theme.space(5),
    paddingTop: theme.space(4),
    paddingBottom: theme.space(2),
    gap: theme.space(1),
  },
  empty: { padding: theme.space(8), gap: theme.space(3), alignItems: 'center' },
  emptyText: { textAlign: 'center' },
  emptyButton: { alignSelf: 'stretch', marginTop: theme.space(2) },
  prepaid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    marginHorizontal: theme.space(5),
    marginTop: theme.space(2),
    padding: theme.space(3.5),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.tint,
    backgroundColor: theme.colors.card,
  },
  prepaidText: { flex: 1 },
  list: { paddingHorizontal: theme.space(5), paddingBottom: theme.space(10), gap: theme.space(2) },
  sectionHeader: {
    marginTop: theme.space(4),
    marginBottom: theme.space(1),
    fontSize: theme.type.label.fontSize,
    textTransform: 'uppercase',
  },
  muted: { color: theme.colors.muted },
  danger: { color: theme.colors.danger },
}));
