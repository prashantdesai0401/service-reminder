import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Chip, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORIES, getCategory, type CategoryId } from '@/constants/categories';
import { TEMPLATES, type TemplateId } from '@/constants/templates';
import type { NewItem } from '@/db/items';

/** The add/edit form for an item. Used by both item/new and item/edit/[id]. */
export function ItemForm({
  initial,
  submitLabel,
  onSubmit,
  showTemplates,
}: {
  initial?: NewItem;
  submitLabel: string;
  /** `templateId` is set when the user started from a quick-start template. */
  onSubmit: (item: NewItem, templateId: TemplateId | null) => void;
  /** Show the "Quick start" template chips (only when adding a new item). */
  showTemplates?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? 'vehicle');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);

  const canSave = name.trim().length > 0;

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {showTemplates && (
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold">Quick start</ThemedText>
              <View style={styles.chips}>
                {TEMPLATES.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.name}
                    icon={getCategory(t.category).icon}
                    selected={templateId === t.id}
                    onPress={() => {
                      setTemplateId(t.id);
                      setName(t.name);
                      setCategory(t.category);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <TextField
            label="Name"
            placeholder="e.g. Activa scooter, Luminous inverter"
            value={name}
            onChangeText={setName}
            autoFocus={!initial && !showTemplates}
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
            onPress={() => onSubmit({ name, category, notes }, templateId)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  content: { padding: theme.space(5), gap: theme.space(5) },
  field: { gap: theme.space(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2) },
  notes: { minHeight: 90, textAlignVertical: 'top' },
}));
