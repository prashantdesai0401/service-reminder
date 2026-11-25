# Intent — Service Reminder

Why this app exists, who it's for, and the principles that decide what goes in.
For *what* is built and *what's next*, see [Plan.md](Plan.md).

## The problem

People pay for, or depend on, services that come due far apart, then forget them.
Forgetting costs real money:

- **Prepaid and wasted.** I paid in advance for my bike's service, to be used a year later.
  A year is long enough to forget completely. The service lapsed and the money was gone.
- **Neglected and damaged.** My inverter battery needs distilled water topped up every few
  weeks. When I forget, the battery wears out sooner, and a replacement costs far more
  than the water.

The gap between the moment you pay or commit and the moment it's due is long, irregular and
easy to forget. Calendars and generic to-do apps don't think in terms of *things you own*
and *how often they need care*, so people don't set them up for this.

## The goal

**Help people never miss a service, repair or renewal that would cost them money if forgotten.**

The app succeeds when someone:

1. Adds the things they look after (bike, inverter, AC, water purifier, car insurance…).
2. Says once when each needs servicing, either on a date or every N days/months/years.
3. Gets reminded early enough to act, and again if they still haven't.
4. Marks it done in a tap, and the next one is scheduled automatically.
5. Has proof and history when they need it: what was done, when, what it cost, and the
   bill or prepaid voucher.

## Who it's for

Everyday people managing a household's vehicles, appliances and devices. They are not
technical, and they don't want to set up a system. They want to be told at the right time.
The first user is me, so the two scenarios above are the test every feature must pass.

## Core scenarios (the acceptance tests)

| Scenario | Must work like this |
|---|---|
| **Prepaid bike service, due in a year** | One-time reminder with "already paid ₹X". Warned 30/7/1 days before and on the day. The app highlights that money is at stake. Nudged again 1, 3 and 7 days late if still not done. |
| **Inverter water, every ~45 days** | Repeating reminder. Marking it done schedules the next one from the day it was *actually* done. Overdue items are impossible to miss. |
| **"When did I last service the AC, and what did it cost?"** | Item page shows history with dates, costs, notes and receipt photos. |
| **"Where's the warranty card / voucher?"** | Photo saved on the item, viewable full screen. |

## Principles

- **Reminders must be reliable.** A reminder that silently doesn't fire is worse than no
  app. Notifications are rebuilt from saved data on every change and app open, survive
  phone restarts, and are tested with the app fully closed.
- **Protect money first.** Prepaid amounts are shown prominently and called out in
  notifications ("don't let it go to waste").
- **Two taps to set up the common cases.** Quick-start templates cover the usual household
  items, and sensible defaults (remind 7 days, 1 day and on the day) mean the form is
  mostly confirmation.
- **Plain language, no jargon.** "Due in 12 days", "Overdue by 3 days", "Mark as done".
- **Private by default.** Everything stays on the phone. No account, no login, works offline.
- **Calm, not naggy.** A few well-timed nudges, at a time of day the user picks.

## Non-goals (for now)

- Not a general to-do list or calendar.
- Not a marketplace for booking service centres.
- No accounts or cloud storage in version 1. Backup and sync come later, and stay optional.
- No iPhone release yet. The app targets Android first, although the code is cross-platform.

## How we'll know it works

- I stop missing my own prepaid services and battery top-ups.
- Every reminder created eventually ends up marked done, not silently overdue.
- Adding an item plus its first reminder takes under 30 seconds using a template.
