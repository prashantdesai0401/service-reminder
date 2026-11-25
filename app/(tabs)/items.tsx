import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES, getCategory } from '@/constants/categories';
import { listItems, type ItemWithNextDue } from '@/db/items';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysUntil, dueLabel } from '@/lib/dates';

export default function ItemsScreen() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<ItemWithNextDue[] | null>(null);
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');
  const danger = useThemeColor({}, 'danger');
  const warning = useThemeColor({}, 'warning');

  // Reload each time the tab is shown, so new/edited/deleted items appear.
  useFocusEffect(
    useCallback(() => {
      listItems(db).then(setItems);
    }, [db])
  );

  // Group items under their category, in the order categories are defined.
  const sections = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        title: c.label,
        data: (items ?? []).filter((i) => i.category === c.id),
      })).filter((s) => s.data.length > 0),
    [items]
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          My items
        </ThemedText>

        {items && items.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="build-circle" size={48} color={muted} />
            <ThemedText type="defaultSemiBold">No items yet</ThemedText>
            <ThemedText style={[styles.emptyText, { color: muted }]}>
              Tap + to add your bike, inverter, AC or anything else that needs regular servicing.
            </ThemedText>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
              <ThemedText type="defaultSemiBold" style={[styles.sectionHeader, { color: muted }]}>
                {section.title}
              </ThemedText>
            )}
            renderItem={({ item }) => {
              const category = getCategory(item.category);
              return (
                <Link href={{ pathname: '/item/[id]', params: { id: item.id } }} asChild>
                  <Pressable style={[styles.row, { backgroundColor: card }]}>
                    <MaterialIcons name={category.icon} size={26} color={tint} />
                    <View style={styles.rowText}>
                      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                      {item.next_due ? (
                        <ThemedText
                          numberOfLines={1}
                          style={{
                            color:
                              daysUntil(item.next_due) <= 0
                                ? danger
                                : daysUntil(item.next_due) <= 7
                                  ? warning
                                  : muted,
                          }}>
                          {item.next_title} · {dueLabel(item.next_due).toLowerCase()}
                        </ThemedText>
                      ) : (
                        <ThemedText numberOfLines={1} style={{ color: muted }}>
                          No reminder set
                        </ThemedText>
                      )}
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={muted} />
                  </Pressable>
                </Link>
              );
            }}
          />
        )}

        <Pressable
          onPress={() => router.push('/item/new')}
          accessibilityRole="button"
          accessibilityLabel="Add item"
          style={({ pressed }) => [styles.fab, { backgroundColor: tint, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialIcons name="add" size={30} color={onTint} />
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  empty: { padding: 32, gap: 12, alignItems: 'center' },
  emptyText: { textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 8 },
  sectionHeader: { marginTop: 16, marginBottom: 4, fontSize: 14, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
  },
  rowText: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
