import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export const CATEGORIES = [
  { id: 'vehicle', label: 'Vehicle', icon: 'two-wheeler' },
  { id: 'appliance', label: 'Appliance', icon: 'kitchen' },
  { id: 'electronics', label: 'Electronics', icon: 'devices' },
  { id: 'power', label: 'Power & battery', icon: 'battery-charging-full' },
  { id: 'home', label: 'Home', icon: 'home-repair-service' },
  { id: 'other', label: 'Other', icon: 'category' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
