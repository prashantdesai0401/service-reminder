import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { withUnistyles } from 'react-native-unistyles';

import type { ColorToken } from '@/unistyles';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

const ThemedMaterialIcons = withUnistyles(MaterialIcons);

/**
 * A Material icon coloured with a theme colour token, e.g. <Icon name="add" color="onTint" />.
 * It follows light/dark mode automatically.
 */
export function Icon({
  name,
  size = 24,
  color = 'text',
}: {
  name: IconName;
  size?: number;
  color?: ColorToken;
}) {
  return (
    <ThemedMaterialIcons
      name={name}
      size={size}
      uniProps={(theme) => ({ color: theme.colors[color] })}
    />
  );
}
