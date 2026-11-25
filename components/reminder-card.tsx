import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCategory } from '@/constants/categories';
import { formatMoney } from '@/constants/money';
import type { Reminder, ReminderWithItem } from '@/db/reminders';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysUntil, dueLabel, formatDate, repeatLabel } from '@/lib/dates';

/** Colour for how urgent a due date is: red overdue/today, amber within a week, otherwise muted. */
function useDueColor(dueDate: string) {
  const danger = useThemeColor({}, 'danger');
  const warning = useThemeColor({}, 'warning');
  const muted = useThemeColor({}, 'muted');
  const days = daysUntil(dueDate);
  if (days <= 0) return danger;
  if (days <= 7) return warning;
  return muted;
}

/**
 * One reminder as a tappable card. Pass `showItem` on the Upcoming list so the card
 * also says which item it belongs to.
 */
export function ReminderCard({
  reminder,
  showItem,
}: {
  reminder: Reminder | ReminderWithItem;
  showItem?: boolean;
}) {
  const card = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');
  const dueColor = useDueColor(reminder.due_date);
  const done = reminder.status === 'done';
  const withItem = showItem && 'item_name' in reminder ? reminder : null;

  const details = [
    formatDate(reminder.due_date),
    reminder.type === 'repeat' && reminder.repeat_every && reminder.repeat_unit
      ? repeatLabel(reminder.repeat_every, reminder.repeat_unit)
      : null,
  ].filter(Boolean);

  return (
    <Link href={{ pathname: '/reminder/[id]', params: { id: reminder.id } }} asChild>
      <Pressable style={[styles.card, { backgroundColor: card }, done && styles.done]}>
        {withItem && (
          <MaterialIcons name={getCategory(withItem.item_category).icon} size={26} color={tint} />
        )}
        <View style={styles.body}>
          {withItem && (
            <ThemedText style={[styles.itemName, { color: muted }]}>
              {withItem.item_name}
            </ThemedText>
          )}
          <ThemedText type="defaultSemiBold">{reminder.title}</ThemedText>
          <ThemedText style={{ color: done ? muted : dueColor }}>
            {done ? 'Done' : dueLabel(reminder.due_date)}
          </ThemedText>
          <ThemedText style={[styles.small, { color: muted }]}>{details.join(' · ')}</ThemedText>
          {reminder.prepaid && (
            <View style={[styles.badge, { borderColor: tint }]}>
              <ThemedText style={[styles.badgeText, { color: tint }]}>
                Prepaid
                {reminder.amount_paid ? ` ${formatMoney(reminder.amount_paid)}` : ''}
              </ThemedText>
            </View>
          )}
        </View>
        {!done && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/reminder/done/[id]',
                params: { id: reminder.id },
              })
            }
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${reminder.title} as done`}
            style={({ pressed }) => [styles.doneButton, pressed && { opacity: 0.6 }]}>
            <MaterialIcons name="check-circle-outline" size={32} color={tint} />
            <ThemedText style={[styles.doneLabel, { color: tint }]}>Done</ThemedText>
          </Pressable>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
  },
  done: { opacity: 0.55 },
  body: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, lineHeight: 18 },
  small: { fontSize: 13, lineHeight: 18 },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  doneButton: { alignItems: 'center', paddingLeft: 4 },
  doneLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  badgeText: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
});
