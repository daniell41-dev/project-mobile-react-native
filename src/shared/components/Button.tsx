import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'danger';
};

export function Button({ label, onPress, variant = 'solid' }: ButtonProps) {
  const theme = useTheme();
  const tint = variant === 'danger' ? theme.colors.down : theme.colors.accent;
  const isSolid = variant === 'solid';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.base,
        {
          borderRadius: theme.radii.md,
          backgroundColor: isSolid ? tint : 'transparent',
          borderWidth: isSolid ? 0 : 1,
          borderColor: tint,
        },
      ]}
    >
      <Text style={[styles.label, { color: isSolid ? theme.colors.bg : tint }]}>{label}</Text>
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
