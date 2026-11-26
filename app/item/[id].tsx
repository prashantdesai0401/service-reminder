import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/form';
import { Icon } from '@/components/icon';
import { PhotoGrid } from '@/components/photo-grid';
import { ReminderCard } from '@/components/reminder-card';
import { ServiceHistory } from '@/components/service-history';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategory } from '@/constants/categories';
import {
  addAttachment,
  listAttachmentsForItem,
  photoFilesFor,
  type AttachmentWithContext,
} from '@/db/attachments';
import { deleteItem, getItem, type Item } from '@/db/items';
import { deleteLog, listLogsForItem, type ServiceLogWithTitle } from '@/db/logs';
import { listRemindersForItem, type Reminder } from '@/db/reminders';
import { confirmDestructive } from '@/lib/confirm';
import { resyncNotifications } from '@/lib/notifications';
import { choosePhoto, deletePhotoFiles } from '@/lib/photos';

export default function ItemDetailScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [logs, setLogs] = useState<ServiceLogWithTitle[]>([]);
  const [photos, setPhotos] = useState<AttachmentWithContext[]>([]);

  // Reload whenever this screen comes back into view (e.g. after editing).
  const load = useCallback(() => {
    getItem(db, Number(id)).then(setItem);
    listRemindersForItem(db, Number(id)).then(setReminders);
    listLogsForItem(db, Number(id)).then(setLogs);
    listAttachmentsForItem(db, Number(id)).then(setPhotos);
  }, [db, id]);
  useFocusEffect(load);

  if (item === undefined) return null;
  if (item === null) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText style={styles.content}>This item no longer exists.</ThemedText>
      </ThemedView>
    );
  }

  const category = getCategory(item.category);

  const addPhoto = async () => {
    const name = await choosePhoto();
    if (!name) return;
    await addAttachment(db, { itemId: item.id }, name);
    load();
  };

  const remove = async () => {
    const files = await photoFilesFor(db, { itemId: item.id });
    await deleteItem(db, item.id);
    deletePhotoFiles(files);
    await resyncNotifications(db);
    router.back();
  };

  const confirmDelete = () =>
    confirmDestructive(
      'Delete item?',
      `Delete "${item.name}" and all its reminders and history? This can't be undone.`,
      remove,
    );

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: item.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBubble}>
            <Icon name={category.icon} size={32} color="tint" />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText style={styles.muted}>{category.label}</ThemedText>
          </View>
        </View>

        {item.notes ? <ThemedText>{item.notes}</ThemedText> : null}

        <View style={styles.section}>
          <ThemedText type="subtitle">Reminders</ThemedText>
          {reminders.length === 0 ? (
            <ThemedText style={styles.muted}>
              No reminders yet. Add one for the next service, refill or renewal.
            </ThemedText>
          ) : (
            reminders.map((r) => <ReminderCard key={r.id} reminder={r} />)
          )}
          <Button
            title="Add reminder"
            onPress={() => router.push({ pathname: '/reminder/new', params: { itemId: item.id } })}
          />
        </View>

        <ServiceHistory
          logs={logs}
          onLongPress={(log) =>
            confirmDestructive(
              'Delete history entry?',
              `Remove "${log.reminder_title}" on this date from the history? The reminder itself stays as it is.`,
              async () => {
                const files = await photoFilesFor(db, { logId: log.id });
                await deleteLog(db, log.id);
                deletePhotoFiles(files);
                load();
              },
            )
          }
        />

        <PhotoGrid photos={photos} onAdd={addPhoto} />

        <View style={styles.actions}>
          <Button
            title="Edit item"
            variant="secondary"
            onPress={() => router.push({ pathname: '/item/edit/[id]', params: { id: item.id } })}
          />
          <Button title="Delete item" variant="danger" onPress={confirmDelete} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  content: { padding: theme.space(5), gap: theme.space(5) },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space(4) },
  headerText: { flex: 1, gap: theme.space(0.5) },
  iconBubble: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  section: { gap: theme.space(2.5) },
  actions: { gap: theme.space(3), marginTop: theme.space(2) },
  muted: { color: theme.colors.muted },
}));
