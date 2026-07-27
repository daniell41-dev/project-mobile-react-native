import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks/useTheme';

type ScreenProps = PropsWithChildren<{
  style?: ViewStyle;
  /** false para pantallas que manejan su propio scroll/padding (p. ej. listas). */
  padded?: boolean;
}>;

export function Screen({ children, style, padded = true }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      <View
        style={[
          styles.content,
          padded && { paddingHorizontal: theme.spacing.screenPadding },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
