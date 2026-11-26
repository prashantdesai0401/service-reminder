import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { LogBox, Platform } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import 'react-native-reanimated';

import { NotificationBootstrap } from '@/components/notification-bootstrap';
import { DATABASE_NAME, migrateDatabase } from '@/db/schema';

// expo-notifications prints these two messages by itself whenever it loads inside Expo Go.
// They are about notifications pushed from a server, which this app doesn't use; the
// reminders it schedules on the phone still work. Hide them from the on-screen error box
// (they still show in the terminal). They go away for good in the real installed app.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications)',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // React Navigation (headers, tab bar) takes plain values; follow Unistyles' light/dark mode.
  const { theme, rt } = useUnistyles();

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
      {Platform.OS !== 'web' && <NotificationBootstrap />}
      <ThemeProvider value={rt.colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/new" options={{ presentation: 'modal', title: 'Add item' }} />
          <Stack.Screen name="item/[id]" options={{ title: '' }} />
          <Stack.Screen
            name="item/edit/[id]"
            options={{ presentation: 'modal', title: 'Edit item' }}
          />
          <Stack.Screen
            name="reminder/new"
            options={{ presentation: 'modal', title: 'Add reminder' }}
          />
          <Stack.Screen
            name="reminder/[id]"
            options={{ presentation: 'modal', title: 'Edit reminder' }}
          />
          <Stack.Screen
            name="reminder/done/[id]"
            options={{ presentation: 'modal', title: 'Mark as done' }}
          />
          <Stack.Screen
            name="photo/[id]"
            options={{
              title: '',
              headerStyle: { backgroundColor: theme.colors.media },
              headerTintColor: theme.colors.onMedia,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
