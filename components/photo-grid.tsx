import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { AttachmentWithContext } from '@/db/attachments';
import { useThemeColor } from '@/hooks/use-theme-color';
import { photoUri } from '@/lib/photos';

/** Item page "Photos" section: thumbnails in a grid plus an "Add photo" tile. */
export function PhotoGrid({
  photos,
  onAdd,
}: {
  photos: AttachmentWithContext[];
  onAdd: () => void;
}) {
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">Photos</ThemedText>
      <ThemedText style={{ color: muted }}>
        Bills, warranty cards, prepaid vouchers and service receipts.
      </ThemedText>
      <View style={styles.grid}>
        {photos.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push({ pathname: '/photo/[id]', params: { id: p.id } })}
            accessibilityRole="imagebutton"
            accessibilityLabel={p.reminder_title ? `Receipt for ${p.reminder_title}` : 'Item photo'}
            style={[styles.tile, { backgroundColor: card }]}>
            <Image source={{ uri: photoUri(p.file_uri) }} style={styles.image} contentFit="cover" />
            {p.log_id != null && (
              <View style={styles.receiptTag}>
                <MaterialIcons name="receipt" size={14} color="#fff" />
              </View>
            )}
          </Pressable>
        ))}
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          style={[styles.tile, styles.addTile, { borderColor: border }]}>
          <MaterialIcons name="add-a-photo" size={28} color={tint} />
          <ThemedText style={[styles.addLabel, { color: tint }]}>Add photo</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31.5%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  receiptTag: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: '#0009',
    borderRadius: 6,
    padding: 3,
  },
  addTile: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
});
