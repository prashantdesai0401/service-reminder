import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/form';
import { deleteAttachment, getAttachment, type AttachmentWithContext } from '@/db/attachments';
import { confirmDestructive } from '@/lib/confirm';
import { formatDate } from '@/lib/dates';
import { deletePhotoFiles, photoUri } from '@/lib/photos';

/** Full-screen view of one photo, with a caption and delete button. */
export default function PhotoScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photo, setPhoto] = useState<AttachmentWithContext | null>(null);

  useEffect(() => {
    getAttachment(db, Number(id)).then(setPhoto);
  }, [db, id]);

  if (!photo) return <View style={styles.screen} />;

  const caption = photo.reminder_title
    ? `Receipt · ${photo.reminder_title}${photo.done_on ? ` · ${formatDate(photo.done_on)}` : ''}`
    : `Added ${formatDate(photo.created_at.slice(0, 10))}`;

  return (
    <View style={styles.screen}>
      <Image source={{ uri: photoUri(photo.file_uri) }} style={styles.image} contentFit="contain" />
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Text style={styles.caption}>{caption}</Text>
        <Button
          title="Delete photo"
          variant="danger"
          onPress={() =>
            confirmDestructive(
              'Delete photo?',
              "This photo will be removed. This can't be undone.",
              async () => {
                await deleteAttachment(db, photo.id);
                deletePhotoFiles([photo.file_uri]);
                router.back();
              },
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1 },
  footer: { padding: 16, gap: 12 },
  caption: { color: '#fff', fontSize: 15, textAlign: 'center' },
});
