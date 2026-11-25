import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatMoney } from '@/constants/money';
import type { ServiceLogWithTitle } from '@/db/logs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDate } from '@/lib/dates';

/** An item's list of completed services, newest first, with the total spent. Long-press to delete. */
export function ServiceHistory({
  logs,
  onLongPress,
}: {
  logs: ServiceLogWithTitle[];
  onLongPress: (log: ServiceLogWithTitle) => void;
}) {
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');

  const total = logs.reduce((sum, l) => sum + (l.cost ?? 0), 0);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">History</ThemedText>
        {total > 0 && (
          <ThemedText style={{ color: muted }}>{formatMoney(total)} spent</ThemedText>
        )}
      </View>

      {logs.length === 0 ? (
        <ThemedText style={{ color: muted }}>
          Nothing yet. When you mark a reminder done, it&apos;s recorded here.
        </ThemedText>
      ) : (
        <View style={[styles.list, { backgroundColor: card }]}>
          {logs.map((log, index) => (
            <Pressable
              key={log.id}
              onLongPress={() => onLongPress(log)}
              style={[styles.row, index > 0 && styles.divider]}>
              <MaterialIcons name="check-circle" size={22} color={tint} />
              <View style={styles.rowText}>
                <View style={styles.titleRow}>
                  <ThemedText type="defaultSemiBold" style={styles.flex}>
                    {log.reminder_title}
                  </ThemedText>
                  {log.cost != null && <ThemedText>{formatMoney(log.cost)}</ThemedText>}
                </View>
                <ThemedText style={[styles.small, { color: muted }]}>{formatDate(log.done_on)}</ThemedText>
                {log.notes ? <ThemedText style={styles.small}>{log.notes}</ThemedText> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  list: { borderRadius: 14, paddingHorizontal: 14 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#8884' },
  rowText: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  small: { fontSize: 14, lineHeight: 20 },
});
