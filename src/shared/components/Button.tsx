import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
};

// Botón mínimo para las pantallas-shell de la FASE 1. El set completo de variantes
// (social, danger, tamaños) llega con el pase de fidelidad visual de la FASE 3.
export function Button({ label, onPress, variant = 'solid' }: ButtonProps) {
  const theme = useTheme();
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.base,
        {
          borderRadius: theme.radii.md,
          backgroundColor: isOutline ? 'transparent' : theme.colors.accent,
          borderWidth: isOutline ? 1 : 0,
          borderColor: theme.colors.accent,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isOutline ? theme.colors.accent : theme.colors.bg },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: fontSize.body,
  },
});
