import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { formatMoney } from '@/constants/money';
import type { ServiceLogWithTitle } from '@/db/logs';
import { formatDate } from '@/lib/dates';

/** An item's list of completed services, newest first, with the total spent. Long-press to delete. */
export function ServiceHistory({
  logs,
  onLongPress,
}: {
  logs: ServiceLogWithTitle[];
  onLongPress: (log: ServiceLogWithTitle) => void;
}) {
  const total = logs.reduce((sum, l) => sum + (l.cost ?? 0), 0);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">History</ThemedText>
        {total > 0 && <ThemedText style={styles.muted}>{formatMoney(total)} spent</ThemedText>}
      </View>

      {logs.length === 0 ? (
        <ThemedText style={styles.muted}>
          Nothing yet. When you mark a reminder done, it&apos;s recorded here.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {logs.map((log, index) => (
            <Pressable
              key={log.id}
              onLongPress={() => onLongPress(log)}
              style={[styles.row, index > 0 && styles.divider]}>
              <Icon name="check-circle" size={22} color="tint" />
              <View style={styles.rowText}>
                <View style={styles.titleRow}>
                  <ThemedText type="defaultSemiBold" style={styles.flex}>
                    {log.reminder_title}
                  </ThemedText>
                  {log.cost != null && <ThemedText>{formatMoney(log.cost)}</ThemedText>}
                </View>
                <ThemedText type="label" style={styles.muted}>
                  {formatDate(log.done_on)}
                </ThemedText>
                {log.notes ? <ThemedText type="label">{log.notes}</ThemedText> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.space(2.5) },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  list: {
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.space(3.5),
    backgroundColor: theme.colors.card,
  },
  row: { flexDirection: 'row', gap: theme.space(3), paddingVertical: theme.space(3) },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.divider },
  rowText: { flex: 1, gap: theme.space(0.5) },
  titleRow: { flexDirection: 'row', gap: theme.space(2) },
  flex: { flex: 1 },
  muted: { color: theme.colors.muted },
}));
