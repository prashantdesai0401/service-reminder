import { EmptyState } from '@/components/empty-state';

// Upcoming tab: will list overdue, this week, and later reminders (Phase 2).
export default function UpcomingScreen() {
  return (
    <EmptyState
      title="Upcoming"
      message="No services due yet. Add an item like your bike or inverter, then set when its service is due."
    />
  );
}
