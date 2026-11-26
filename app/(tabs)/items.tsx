import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES, getCategory } from '@/constants/categories';
import { listItems, type ItemWithNextDue } from '@/db/items';
import { daysUntil, dueLabel } from '@/lib/dates';

export default function ItemsScreen() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<ItemWithNextDue[] | null>(null);

  // Reload each time the tab is shown, so new/edited/deleted items appear.
  useFocusEffect(
    useCallback(() => {
      listItems(db).then(setItems);
    }, [db]),
  );

  // Group items under their category, in the order categories are defined.
  const sections = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        title: c.label,
        data: (items ?? []).filter((i) => i.category === c.id),
      })).filter((s) => s.data.length > 0),
    [items],
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ThemedText type="title" style={styles.title}>
          My items
        </ThemedText>

        {items && items.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="build-circle" size={48} color="muted" />
            <ThemedText type="defaultSemiBold">No items yet</ThemedText>
            <ThemedText style={[styles.emptyText, styles.muted]}>
              Tap + to add your bike, inverter, AC or anything else that needs regular servicing.
            </ThemedText>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
              <ThemedText type="defaultSemiBold" style={[styles.sectionHeader, styles.muted]}>
                {section.title}
              </ThemedText>
            )}
            renderItem={({ item }) => {
              const category = getCategory(item.category);
              return (
                <Pressable
                  onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
                  accessibilityRole="button"
                  style={styles.row}>
                  <Icon name={category.icon} size={26} color="tint" />
                  <View style={styles.rowText}>
                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                    {item.next_due ? (
                      <ThemedText
                        numberOfLines={1}
                        style={
                          daysUntil(item.next_due) <= 0
                            ? styles.danger
                            : daysUntil(item.next_due) <= 7
                              ? styles.warning
                              : styles.muted
                        }>
                        {item.next_title} · {dueLabel(item.next_due).toLowerCase()}
                      </ThemedText>
                    ) : (
                      <ThemedText numberOfLines={1} style={styles.muted}>
                        No reminder set
                      </ThemedText>
                    )}
                  </View>
                  <Icon name="chevron-right" size={24} color="muted" />
                </Pressable>
              );
            }}
          />
        )}

        <Pressable
          onPress={() => router.push('/item/new')}
          accessibilityRole="button"
          accessibilityLabel="Add item"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <Icon name="add" size={30} color="onTint" />
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  title: {
    paddingHorizontal: theme.space(5),
    paddingTop: theme.space(4),
    paddingBottom: theme.space(2),
  },
  empty: { padding: theme.space(8), gap: theme.space(3), alignItems: 'center' },
  emptyText: { textAlign: 'center' },
  list: { paddingHorizontal: theme.space(5), paddingBottom: 100, gap: theme.space(2) },
  sectionHeader: {
    marginTop: theme.space(4),
    marginBottom: theme.space(1),
    fontSize: theme.type.label.fontSize,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3.5),
    padding: theme.space(3.5),
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
  },
  rowText: { flex: 1 },
  fab: {
    position: 'absolute',
    right: theme.space(5),
    bottom: theme.space(5),
    width: 60,
    height: 60,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.tint,
    elevation: 4,
    shadowColor: theme.colors.media,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: { opacity: 0.8 },
  muted: { color: theme.colors.muted },
  danger: { color: theme.colors.danger },
  warning: { color: theme.colors.warning },
}));
