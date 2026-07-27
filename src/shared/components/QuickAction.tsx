import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function QuickAction({ icon, label, onPress }: QuickActionProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.lg },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.colors.accent} />
      </View>
      <AppText variant="label" tone="textDim">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
