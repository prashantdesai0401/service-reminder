import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import type { AttachmentWithContext } from '@/db/attachments';
import { photoUri } from '@/lib/photos';

/** Item page "Photos" section: thumbnails in a grid plus an "Add photo" tile. */
export function PhotoGrid({
  photos,
  onAdd,
}: {
  photos: AttachmentWithContext[];
  onAdd: () => void;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">Photos</ThemedText>
      <ThemedText style={styles.muted}>
        Bills, warranty cards, prepaid vouchers and service receipts.
      </ThemedText>
      <View style={styles.grid}>
        {photos.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push({ pathname: '/photo/[id]', params: { id: p.id } })}
            accessibilityRole="imagebutton"
            accessibilityLabel={p.reminder_title ? `Receipt for ${p.reminder_title}` : 'Item photo'}
            style={[styles.tile, styles.photoTile]}>
            <Image source={{ uri: photoUri(p.file_uri) }} style={styles.image} contentFit="cover" />
            {p.log_id != null && (
              <View style={styles.receiptTag}>
                <Icon name="receipt" size={14} color="onMedia" />
              </View>
            )}
          </Pressable>
        ))}
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          style={[styles.tile, styles.addTile]}>
          <Icon name="add-a-photo" size={28} color="tint" />
          <ThemedText type="small" style={styles.addLabel}>
            Add photo
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.space(2.5) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2) },
  tile: { width: '31.5%', aspectRatio: 1, borderRadius: theme.radius.lg, overflow: 'hidden' },
  photoTile: { backgroundColor: theme.colors.card },
  image: { width: '100%', height: '100%' },
  receiptTag: {
    position: 'absolute',
    left: theme.space(1.5),
    bottom: theme.space(1.5),
    backgroundColor: theme.colors.scrim,
    borderRadius: theme.radius.xs,
    padding: theme.space(0.75),
  },
  addTile: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(1),
  },
  addLabel: { color: theme.colors.tint, fontWeight: '600' },
  muted: { color: theme.colors.muted },
}));
