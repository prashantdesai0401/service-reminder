import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { DateField } from '@/components/date-field';
import { Button, Chip, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CURRENCY } from '@/constants/money';
import type { ReminderInput, ReminderType } from '@/db/reminders';
import { addInterval, todayKey, type RepeatUnit } from '@/lib/dates';

const TITLE_SUGGESTIONS = [
  'Service',
  'Top up distilled water',
  'Filter change',
  'Insurance renewal',
];
const UNITS: RepeatUnit[] = ['days', 'weeks', 'months', 'years'];
const NOTIFY_OPTIONS = [
  { days: 30, label: '30 days before' },
  { days: 7, label: '7 days before' },
  { days: 1, label: '1 day before' },
  { days: 0, label: 'On the day' },
];

/** The add/edit form for a reminder. Used by reminder/new and reminder/[id]. */
export function ReminderForm({
  initial,
  submitLabel,
  onSubmit,
  footer,
}: {
  initial?: ReminderInput;
  submitLabel: string;
  onSubmit: (r: ReminderInput) => void;
  footer?: ReactNode;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<ReminderType>(initial?.type ?? 'once');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? addInterval(todayKey(), 1, 'months'));
  const [repeatEvery, setRepeatEvery] = useState(String(initial?.repeat_every ?? 1));
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>(initial?.repeat_unit ?? 'months');
  const [notify, setNotify] = useState<number[]>(initial?.notify_days_before ?? [7, 1, 0]);
  const [prepaid, setPrepaid] = useState(initial?.prepaid ?? false);
  const [amount, setAmount] = useState(
    initial?.amount_paid != null ? String(initial.amount_paid) : '',
  );
  const [providerName, setProviderName] = useState(initial?.provider_name ?? '');
  const [providerPhone, setProviderPhone] = useState(initial?.provider_phone ?? '');

  const every = parseInt(repeatEvery, 10);
  const canSave = title.trim().length > 0 && (type === 'once' || every > 0);

  const toggleNotify = (days: number) =>
    setNotify((list) =>
      list.includes(days) ? list.filter((d) => d !== days) : [...list, days].sort((a, b) => b - a),
    );

  const submit = () =>
    onSubmit({
      title,
      type,
      due_date: dueDate,
      repeat_every: type === 'repeat' ? every : null,
      repeat_unit: type === 'repeat' ? repeatUnit : null,
      notify_days_before: notify,
      prepaid,
      amount_paid: prepaid && amount ? Number(amount.replace(/[^0-9.]/g, '')) || null : null,
      provider_name: providerName,
      provider_phone: providerPhone,
    });

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <TextField
              label="What needs doing?"
              placeholder="e.g. Annual service"
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.chips}>
              {TITLE_SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} selected={title === s} onPress={() => setTitle(s)} />
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">How often?</ThemedText>
            <View style={styles.chips}>
              <Chip
                label="One time"
                icon="event"
                selected={type === 'once'}
                onPress={() => setType('once')}
              />
              <Chip
                label="Repeats"
                icon="repeat"
                selected={type === 'repeat'}
                onPress={() => setType('repeat')}
              />
            </View>
          </View>

          {type === 'repeat' && (
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold">Repeat every</ThemedText>
              <View style={styles.repeatRow}>
                <TextField
                  accessibilityLabel="Repeat every how many"
                  value={repeatEvery}
                  onChangeText={setRepeatEvery}
                  keyboardType="number-pad"
                  style={styles.repeatInput}
                />
                <View style={[styles.chips, styles.repeatUnits]}>
                  {UNITS.map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      selected={repeatUnit === u}
                      onPress={() => setRepeatUnit(u)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          <DateField
            label={type === 'repeat' ? 'Next due on' : 'Due on'}
            value={dueDate}
            onChange={setDueDate}
          />

          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Remind me</ThemedText>
            <View style={styles.chips}>
              {NOTIFY_OPTIONS.map((o) => (
                <Chip
                  key={o.days}
                  label={o.label}
                  selected={notify.includes(o.days)}
                  onPress={() => toggleNotify(o.days)}
                />
              ))}
            </View>
            {notify.length === 0 && (
              <ThemedText style={styles.muted}>No notifications will be sent.</ThemedText>
            )}
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <ThemedText type="defaultSemiBold">Already paid in advance</ThemedText>
              <ThemedText style={styles.muted}>
                So you don&apos;t waste a prepaid service
              </ThemedText>
            </View>
            <ThemedSwitch value={prepaid} onValueChange={setPrepaid} />
          </View>

          {prepaid && (
            <TextField
              label={`Amount paid (${CURRENCY})`}
              placeholder="e.g. 1500"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          )}

          <TextField
            label="Service centre (optional)"
            placeholder="e.g. Honda Service, MG Road"
            value={providerName}
            onChangeText={setProviderName}
          />
          <TextField
            label="Service centre phone (optional)"
            placeholder="e.g. 98765 43210"
            value={providerPhone}
            onChangeText={setProviderPhone}
            keyboardType="phone-pad"
          />

          <Button title={submitLabel} disabled={!canSave} onPress={submit} />
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// Switch whose "on" track uses the theme's accent colour.
const ThemedSwitch = withUnistyles(Switch, (theme) => ({
  trackColor: { true: theme.colors.tint },
}));

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  content: { padding: theme.space(5), gap: theme.space(5.5), paddingBottom: theme.space(10) },
  field: { gap: theme.space(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2) },
  repeatRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space(3) },
  repeatInput: { width: 64, textAlign: 'center' },
  repeatUnits: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space(3) },
  switchText: { flex: 1 },
  muted: { color: theme.colors.muted },
}));
