import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Props = {
  title: string;
  message: string;
};

/** A full-screen title + friendly message, used when a list has nothing in it yet. */
export function EmptyState({ title, message }: Props) {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  inner: { flex: 1, padding: 24, gap: 12 },
  message: { opacity: 0.7 },
});
