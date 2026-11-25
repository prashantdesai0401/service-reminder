import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DATABASE_NAME, migrateDatabase } from '@/db/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/new" options={{ presentation: 'modal', title: 'Add item' }} />
          <Stack.Screen name="item/[id]" options={{ title: '' }} />
          <Stack.Screen name="item/edit/[id]" options={{ presentation: 'modal', title: 'Edit item' }} />
          <Stack.Screen name="reminder/new" options={{ presentation: 'modal', title: 'Add reminder' }} />
          <Stack.Screen name="reminder/[id]" options={{ presentation: 'modal', title: 'Edit reminder' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
