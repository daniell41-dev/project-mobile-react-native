import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';

type ChipProps = {
  label: string;
  color?: 'success' | 'neutral';
};

export function Chip({ label, color = 'neutral' }: ChipProps) {
  const theme = useTheme();
  const backgroundColor = color === 'success' ? theme.colors.up : theme.colors.surface3;

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <AppText variant="label" tone="onAccent" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
