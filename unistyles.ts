import { StyleSheet } from 'react-native-unistyles';

/**
 * Design tokens for the whole app. Every screen reads colours, spacing, corner radius and
 * text styles from here, so changing a value (e.g. from the Figma design system) updates
 * the app everywhere. The theme switches automatically with the phone's dark mode.
 */

/** Spacing on a 4-point grid: space(1) = 4, space(4) = 16. Half steps (space(1.5) = 6) are off-grid values kept from v1. */
const space = (n: number) => n * 4;

const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  full: 999,
} as const;

const type = {
  title: { fontSize: 32, lineHeight: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16, lineHeight: 24 },
  bodySemiBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  link: { fontSize: 16, lineHeight: 30 },
  label: { fontSize: 14, lineHeight: 20 },
  small: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;

/** Colours that are the same in light and dark mode (e.g. the black photo viewer). */
const fixed = {
  media: '#000000',
  onMedia: '#FFFFFF',
  scrim: '#00000099',
  divider: '#88888844',
};

const lightTheme = {
  colors: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#0A7EA4',
    onTint: '#FFFFFF',
    icon: '#687076',
    card: '#F3F5F6',
    border: '#DDE1E3',
    muted: '#687076',
    danger: '#D93025',
    warning: '#B26A00',
    ...fixed,
  },
  space,
  radius,
  type,
};

const darkTheme = {
  colors: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#5BC0EB',
    onTint: '#0B1A20',
    icon: '#9BA1A6',
    card: '#202425',
    border: '#33393B',
    muted: '#9BA1A6',
    danger: '#FF6B5E',
    warning: '#F5B041',
    ...fixed,
  },
  space,
  radius,
  type,
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

export type AppTheme = typeof lightTheme;
export type ColorToken = keyof AppTheme['colors'];

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: { adaptiveThemes: true },
});
