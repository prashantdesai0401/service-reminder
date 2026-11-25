# Plan — Service Reminder

What's built, how it's put together, and what comes next.
For *why* the app exists and the principles behind it, see [intent.md](intent.md).
For building and installing the Android app, see [BUILDING.md](BUILDING.md).

**Status (25 Nov 2026):** version 1 is complete and installed as a real Android app.
Notifications are confirmed working with the app closed.

---

## Key decisions

| Decision | Choice | Why |
|---|---|---|
| Platform | Android first, built with React Native + Expo (SDK 54) | One codebase; iPhone possible later |
| Storage | On the phone only (SQLite) | No login, works offline, private. Cloud is optional later |
| Notifications | Scheduled on the phone (`expo-notifications`) | Work offline and in Expo Go. No server needed |
| Reliability | Rebuild *all* scheduled notifications from the database on every change and every app open | Stays correct after edits, deletes and phone restarts |
| Dates | Stored as plain calendar days (`YYYY-MM-DD`) | "Due 1 Sep" stays 1 Sep regardless of time zone |
| Repeat logic | Next due = the date it was **actually done** + interval | Being late doesn't make the next one due sooner |
| Photos | Copied into the app's own storage; only the file name is saved | Survive gallery deletion and app updates |
| Currency | Indian rupees (₹) | First users are in India; one constant to change |

---

## Version 1 — done ✅

| Phase | What it delivered |
|---|---|
| 0. Setup | Fresh Expo project, three tabs (Upcoming, Items, Settings), libraries installed |
| 1. Items | Database; add, edit and delete items with category and notes |
| 2. Reminders | One-time or repeating reminders, due-date picker, "remind me" choices, prepaid amount, service centre details; Upcoming tab grouped Overdue / This week / This month / Later |
| 3. Notifications | Reminders at a chosen time of day, nudges 1/3/7 days after a missed date, tap opens the reminder, Settings with permission status and a test notification |
| 4. Mark done + history | Done button on every reminder; repeating ones roll forward; service history with cost, notes and total spent |
| 5. Photos | Bill, voucher, warranty and receipt photos on items and service entries; full-screen viewer; files cleaned up on delete |
| 6. Polish | Quick-start templates (bike, car, insurance, PUC, inverter, AC, water purifier, chimney), next-due on the Items list, prepaid-money banner, friendly empty screens, dark mode |
| 7. Real app | EAS build settings, installable APK, build and update guide |

---

## How the code is organised

```
app/                      Screens (each file = one screen; folders = URL paths)
  _layout.tsx             App shell: database, notifications, screen list
  (tabs)/index.tsx        Upcoming
  (tabs)/items.tsx        Items list
  (tabs)/settings.tsx     Settings
  item/new.tsx            Add item (with quick-start templates)
  item/[id].tsx           Item page: reminders, history, photos
  item/edit/[id].tsx      Edit item
  reminder/new.tsx        Add reminder
  reminder/[id].tsx       Edit / delete / mark done
  reminder/done/[id].tsx  Mark as done (date, cost, notes, receipt)
  photo/[id].tsx          Full-screen photo
components/               Reusable building blocks (cards, forms, photo grid…)
db/                       Everything that reads or writes saved data
  schema.ts               Tables and upgrades (add a new numbered step to change them)
  items.ts reminders.ts logs.ts attachments.ts settings.ts
lib/                      Logic with no screen: dates, notifications, photos, confirm dialog
constants/                Theme colours, categories, templates, currency
```

**Data model:** `items` → many `reminders` → many `service_logs`. `attachments` (photos)
belong to an item or to a service log. `settings` holds preferences such as reminder time.
Deleting an item removes everything under it, photo files included.

---

## Next — version 1.1 (recommended order)

### 1. Backup and restore — **highest priority**
All data lives only on the phone, so a lost or reset phone means losing history and receipts.
- "Export backup" creates one file (data + photos) and shares it to Google Drive, WhatsApp, email, etc.
- "Restore from backup" picks that file and replaces the current data, after a confirmation.
- Optional: remind the user to back up monthly.
- **Done when:** export on one phone, restore on another (or after reinstalling), and everything is back, including photos and notifications.

### 2. Apply the Figma designs
Replace the default look with the designed one.
- Colour, type and spacing tokens go into `constants/theme.ts`. Restyle `components/form.tsx`, the cards and the screens.
- Possibly a custom font, app icon and splash screen.
- **Done when:** each screen matches its Figma frame in light and dark mode.

### 3. Small improvements
- Undo for "Mark as done" (moves the due date back and removes the history entry).
- Custom reminder time per reminder, not just one global time.
- Search and sort on the Items list once it grows.
- Let the user choose the currency in Settings.
- Haptic feedback on Done.

### 4. Release
- Rebuild the APK. This also drops the unused microphone permission, which is already fixed in the code.
- Raise `version` and `android.versionCode` in `app.json` for every release (see BUILDING.md).

---

## Later — ideas, not yet committed

- **Family sharing:** one household's items and reminders shared across phones. Needs cloud sync and accounts, possibly InstantDB.
- **Home-screen widget:** see what's due next without opening the app.
- **Google Play Store listing:** a developer account, privacy policy, screenshots and store text.
- **Smart suggestions:** typical intervals per item type, and "you usually spend ₹X on this".
- **iPhone version:** the code is already cross-platform. It needs an Apple developer account and testing.
- **Service centre quick actions:** tap to call or open WhatsApp from a reminder.

---

## How we work

1. Pick the next item above and agree on what "done" looks like.
2. Claude writes the code and checks it (typecheck, lint, Expo health checks).
3. Test it on the phone: Expo Go for quick checks, a fresh APK for notifications and releases.
4. Commit with a clear message and push to GitHub (`git push`).
5. Update this file: move the item to "done" and note any new decisions.
