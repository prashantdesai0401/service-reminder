import { EmptyState } from '@/components/empty-state';

// Items tab: will list your devices and appliances grouped by category (Phase 1).
export default function ItemsScreen() {
  return (
    <EmptyState
      title="My items"
      message="Your vehicles, appliances and devices will show up here."
    />
  );
}
