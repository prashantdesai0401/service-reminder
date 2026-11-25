import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES, type CategoryId } from '@/constants/categories';
import type { NewItem } from '@/db/items';

/** The add/edit form for an item. Used by both item/new and item/edit/[id]. */
export function ItemForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: NewItem;
  submitLabel: string;
  onSubmit: (item: NewItem) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? 'vehicle');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const canSave = name.trim().length > 0;

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label="Name"
            placeholder="e.g. Activa scooter, Luminous inverter"
            value={name}
            onChangeText={setName}
            autoFocus={!initial}
            returnKeyType="done"
          />

          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Category</ThemedText>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  label={c.label}
                  icon={c.icon}
                  selected={category === c.id}
                  onPress={() => setCategory(c.id)}
                />
              ))}
            </View>
          </View>

          <TextField
            label="Notes (optional)"
            placeholder="Model, purchase date, warranty details…"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.notes}
          />

          <Button
            title={submitLabel}
            disabled={!canSave}
            onPress={() => onSubmit({ name, category, notes })}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 20 },
  field: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notes: { minHeight: 90, textAlignVertical: 'top' },
});
