import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategory } from '@/constants/categories';
import { deleteItem, getItem, type Item } from '@/db/items';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ItemDetailScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');

  // Reload whenever this screen comes back into view (e.g. after editing).
  useFocusEffect(
    useCallback(() => {
      getItem(db, Number(id)).then(setItem);
    }, [db, id])
  );

  if (item === undefined) return null;
  if (item === null) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText style={styles.content}>This item no longer exists.</ThemedText>
      </ThemedView>
    );
  }

  const category = getCategory(item.category);

  const remove = async () => {
    await deleteItem(db, item.id);
    router.back();
  };

  const confirmDelete = () => {
    const message = `Delete "${item.name}" and all its reminders and history? This can't be undone.`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) remove();
      return;
    }
    Alert.alert('Delete item?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: item.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBubble, { backgroundColor: card }]}>
            <MaterialIcons name={category.icon} size={32} color={tint} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText style={{ color: muted }}>{category.label}</ThemedText>
          </View>
        </View>

        {item.notes ? <ThemedText>{item.notes}</ThemedText> : null}

        <View style={[styles.section, { backgroundColor: card }]}>
          <ThemedText type="defaultSemiBold">Reminders</ThemedText>
          <ThemedText style={{ color: muted }}>
            Service reminders for this item will appear here.
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Button
            title="Edit item"
            variant="secondary"
            onPress={() => router.push(`/item/edit/${item.id}`)}
          />
          <Button title="Delete item" variant="danger" onPress={confirmDelete} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerText: { flex: 1, gap: 2 },
  iconBubble: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  section: { borderRadius: 14, padding: 16, gap: 6 },
  actions: { gap: 12, marginTop: 8 },
});
