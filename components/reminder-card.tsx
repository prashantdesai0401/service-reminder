import { Link, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { getCategory } from '@/constants/categories';
import { formatMoney } from '@/constants/money';
import type { Reminder, ReminderWithItem } from '@/db/reminders';
import { daysUntil, dueLabel, formatDate, repeatLabel } from '@/lib/dates';

/** How urgent a due date is: red overdue/today, amber within a week, otherwise muted. */
function dueStyle(dueDate: string) {
  const days = daysUntil(dueDate);
  if (days <= 0) return styles.danger;
  if (days <= 7) return styles.warning;
  return styles.muted;
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
      <Pressable style={[styles.card, done && styles.done]}>
        {withItem && (
          <Icon name={getCategory(withItem.item_category).icon} size={26} color="tint" />
        )}
        <View style={styles.body}>
          {withItem && (
            <ThemedText type="small" style={styles.muted}>
              {withItem.item_name}
            </ThemedText>
          )}
          <ThemedText type="defaultSemiBold">{reminder.title}</ThemedText>
          <ThemedText style={done ? styles.muted : dueStyle(reminder.due_date)}>
            {done ? 'Done' : dueLabel(reminder.due_date)}
          </ThemedText>
          <ThemedText type="small" style={styles.muted}>
            {details.join(' · ')}
          </ThemedText>
          {reminder.prepaid && (
            <View style={styles.badge}>
              <ThemedText type="caption" style={styles.badgeText}>
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
            style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}>
            <Icon name="check-circle-outline" size={32} color="tint" />
            <ThemedText type="caption" style={styles.tint}>
              Done
            </ThemedText>
          </Pressable>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3.5),
    padding: theme.space(3.5),
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
  },
  done: { opacity: 0.55 },
  body: { flex: 1, gap: theme.space(0.5) },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.tint,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.space(2),
    paddingVertical: theme.space(0.5),
    marginTop: theme.space(1),
  },
  badgeText: { color: theme.colors.tint, lineHeight: 18 },
  doneButton: { alignItems: 'center', paddingLeft: theme.space(1) },
  pressed: { opacity: 0.6 },
  muted: { color: theme.colors.muted },
  tint: { color: theme.colors.tint },
  danger: { color: theme.colors.danger },
  warning: { color: theme.colors.warning },
}));
