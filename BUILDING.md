# Building Service Reminder as a real Android app

Expo Go is great for trying changes, but it's a "player" for apps under development.
To get **Service Reminder** as its own app on your phone (own icon, no Expo Go, no yellow
warnings), Expo's free cloud service **EAS Build** turns this project into an installable
`.apk` file.

You do this once per version. Day-to-day editing still uses `npx expo start` + Expo Go.

## One-time setup

1. **Create a free Expo account** at https://expo.dev/signup (skip if you have one).
2. Open a terminal in this folder (`D:\Claude stuff\service-reminder\service-reminder`).
3. Install the EAS command-line tool:
   ```powershell
   npm install -g eas-cli
   ```
4. Log in (type your Expo email/username and password when asked):
   ```powershell
   eas login
   ```
5. Link this project to your account. Answer **Yes** when it asks to create a project.
   It adds a `projectId` to `app.json`:
   ```powershell
   eas init
   ```

## Build the installable APK

```powershell
eas build --platform android --profile preview
```

- Answer **Yes** when it offers to **generate a new Android Keystore**. This is the app's
  signature; Expo stores it safely for you. Keep using the same account so future updates
  can install over the old app.
- The build runs on Expo's servers and takes roughly 10–20 minutes (free accounts may wait
  in a queue first). You can close the terminal; progress is also shown at https://expo.dev.
- When it finishes you get a link and a QR code.

## Install it on your phone

1. Open the link (or scan the QR code) **on your Android phone** and download the `.apk`.
2. Android will warn about installing from an unknown source. Allow it for your browser
   (Settings → Apps → *your browser* → Install unknown apps), then tap Install.
3. Open **Service Reminder** from your app drawer.

> Your data does **not** carry over from Expo Go — the installed app is a separate app with
> its own storage. Add your real items again in the installed app.

## Check notifications in the real app

1. Open the app → **Settings** → turn on notifications → **Send a test notification**,
   then lock the phone. It should arrive within ~10 seconds.
2. Add a reminder due tomorrow with "1 day before" ticked, and set **Remind me at** to a
   time shortly ahead. Close the app completely (swipe it away). It should still arrive.
3. Restart the phone, open the app once, and check Settings still shows the same number of
   scheduled notifications.
4. On Xiaomi / Oppo / Vivo / Realme / OnePlus phones, set the app's battery usage to
   **No restrictions** (App info → Battery), or the phone may silence it in the background.

## Releasing an update later

1. In `app.json`, raise `"version"` (e.g. `1.0.0` → `1.1.0`) **and** `android.versionCode`
   by 1 (e.g. `1` → `2`). Android refuses an update whose versionCode isn't higher.
2. Run the same `eas build --platform android --profile preview` command and install the new APK
   over the old one. Your data is kept.

## Optional: Google Play Store

- Needs a Google Play Developer account (one-time US$25 fee) and a privacy policy page.
- Build the Play Store format with `eas build --platform android --profile production`
  (an `.aab` file), then upload it in Google Play Console, or use `eas submit -p android`.
- The app ID `com.servicereminder.app` (in `app.json`) is permanent once published.
  Change it before your first Play Store upload if you want a different one.
