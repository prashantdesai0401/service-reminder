import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/** A View with the theme's page background colour. */
export function ThemedView({ style, ...otherProps }: ViewProps) {
  return <View style={[styles.view, style]} {...otherProps} />;
}

const styles = StyleSheet.create((theme) => ({
  view: { backgroundColor: theme.colors.background },
}));
