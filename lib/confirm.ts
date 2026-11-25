import { Alert, Platform } from 'react-native';

/** Asks "are you sure?" before a destructive action; runs `onConfirm` only on yes. */
export function confirmDestructive(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}
