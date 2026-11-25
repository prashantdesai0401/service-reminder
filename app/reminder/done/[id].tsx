import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { Button, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CURRENCY } from '@/constants/money';
import { markDone, nextDueAfter } from '@/db/logs';
import { getReminder, type Reminder } from '@/db/reminders';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDate, todayKey } from '@/lib/dates';
import { resyncNotifications } from '@/lib/notifications';

export default function MarkDoneScreen() {
  const db = useSQLiteContext();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [doneOn, setDoneOn] = useState(todayKey());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');

  useEffect(() => {
    getReminder(db, Number(id)).then((r) => {
      setReminder(r);
      // If it was prepaid, the cost is already known.
      if (r?.prepaid && r.amount_paid) setCost(String(r.amount_paid));
    });
  }, [db, id]);

  if (!reminder) return null;

  const next = nextDueAfter(reminder, doneOn);

  const save = async () => {
    setSaving(true);
    await markDone(db, reminder, {
      done_on: doneOn,
      cost: cost ? Number(cost.replace(/[^0-9.]/g, '')) || null : null,
      notes,
    });
    await resyncNotifications(db);
    // Close this screen, and the edit screen underneath too if we came from there.
    router.dismiss(from === 'edit' ? 2 : 1);
  };

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">{reminder.title}</ThemedText>

          <DateField label="Done on" value={doneOn} onChange={setDoneOn} />

          <TextField
            label={`Cost (${CURRENCY}, optional)`}
            placeholder="e.g. 850"
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />

          <TextField
            label="Notes (optional)"
            placeholder="e.g. Changed engine oil, brake pads replaced"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.notes}
          />

          <View style={[styles.preview, { backgroundColor: card }]}>
            <ThemedText style={{ color: muted }}>
              {next
                ? `Next reminder will be set for ${formatDate(next)}.`
                : 'This one-time reminder will move to the item’s history.'}
            </ThemedText>
          </View>

          <Button title="Mark as done" onPress={save} disabled={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 20 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  preview: { borderRadius: 12, padding: 14 },
});
