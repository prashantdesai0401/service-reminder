import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

/** Label + text box. */
export function TextField({ label, style, ...inputProps }: TextInputProps & { label: string }) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={muted}
        style={[styles.input, { color: text, borderColor: border, backgroundColor: card }, style]}
        {...inputProps}
      />
    </View>
  );
}

/** A small rounded selectable pill, e.g. a category choice. */
export function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  selected: boolean;
  onPress: () => void;
}) {
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const color = selected ? onTint : text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { borderColor: selected ? tint : border, backgroundColor: selected ? tint : 'transparent' },
      ]}>
      {icon && <MaterialIcons name={icon} size={18} color={color} />}
      <ThemedText style={{ color }}>{label}</ThemedText>
    </Pressable>
  );
}

/** Full-width button. `variant="danger"` for delete actions, `"secondary"` for outlined. */
export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const danger = useThemeColor({}, 'danger');

  const filled = variant === 'primary';
  const accent = variant === 'danger' ? danger : tint;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { borderColor: accent, backgroundColor: filled ? accent : 'transparent' },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.7 },
      ]}>
      <ThemedText type="defaultSemiBold" style={{ color: filled ? onTint : accent }}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  button: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
  },
});
