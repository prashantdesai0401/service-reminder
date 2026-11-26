import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type ThemedTextProps = TextProps & {
  /** Text style from the theme's type scale. */
  type?:
    'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'label' | 'small' | 'caption';
};

/** Text in the theme's text colour and type scale. Pass `style` to override (e.g. a muted colour). */
export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  return <Text style={[styles.base, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  base: { color: theme.colors.text },
  default: theme.type.body,
  defaultSemiBold: theme.type.bodySemiBold,
  title: theme.type.title,
  subtitle: theme.type.subtitle,
  link: { ...theme.type.link, color: theme.colors.tint },
  label: theme.type.label,
  small: theme.type.small,
  caption: theme.type.caption,
}));
