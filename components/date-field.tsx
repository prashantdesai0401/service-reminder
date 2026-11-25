import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDate, parseDateKey, toDateKey } from '@/lib/dates';

/** Label + tappable date that opens the phone's calendar picker. Value is "YYYY-MM-DD". */
export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (key: string) => void;
}) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');

  // The native picker doesn't exist in a web browser, so type the date there instead.
  if (Platform.OS === 'web') {
    return (
      <TextField
        label={`${label} (YYYY-MM-DD)`}
        onChangeText={(t) => /^\d{4}-\d{2}-\d{2}$/.test(t) && onChange(t)}
        defaultValue={value}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <DateTimePicker
          value={parseDateKey(value)}
          mode="date"
          display="compact"
          onChange={(_, date) => date && onChange(toDateKey(date))}
          style={styles.iosPicker}
        />
      </View>
    );
  }

  const open = () =>
    DateTimePickerAndroid.open({
      value: parseDateKey(value),
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChange(toDateKey(date));
      },
    });

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        style={[styles.box, { borderColor: border, backgroundColor: card }]}>
        <ThemedText style={{ color: text }}>{formatDate(value)}</ThemedText>
        <MaterialIcons name="calendar-month" size={22} color={tint} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iosPicker: { alignSelf: 'flex-start' },
});
