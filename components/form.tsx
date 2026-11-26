import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';

// TextInput with the placeholder colour taken from the theme.
const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.muted,
}));

/** Label + text box. */
export function TextField({ label, style, ...inputProps }: TextInputProps & { label?: string }) {
  return (
    <View style={styles.field}>
      {label ? <ThemedText type="defaultSemiBold">{label}</ThemedText> : null}
      <ThemedTextInput style={[styles.input, style]} {...inputProps} />
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
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}>
      {icon && <Icon name={icon} size={18} color={selected ? 'onTint' : 'text'} />}
      <ThemedText style={selected && styles.onTint}>{label}</ThemedText>
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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'danger' && styles.buttonDanger,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <ThemedText
        type="defaultSemiBold"
        style={
          variant === 'primary' ? styles.onTint : variant === 'danger' ? styles.danger : styles.tint
        }>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  field: { gap: theme.space(1.5) },
  input: {
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(2.5),
    fontSize: theme.type.body.fontSize,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(1.5),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(1.5),
  },
  chipSelected: {
    borderColor: theme.colors.tint,
    backgroundColor: theme.colors.tint,
  },
  button: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.tint,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.space(3.5),
  },
  buttonPrimary: { backgroundColor: theme.colors.tint },
  buttonDanger: { borderColor: theme.colors.danger },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  onTint: { color: theme.colors.onTint },
  tint: { color: theme.colors.tint },
  danger: { color: theme.colors.danger },
}));
