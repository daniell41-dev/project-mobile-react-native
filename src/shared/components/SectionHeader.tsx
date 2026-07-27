import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="itemTitle">{title}</AppText>
      {actionLabel && (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <AppText variant="subtitle" tone="accent">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
