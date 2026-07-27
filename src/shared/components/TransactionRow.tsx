import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Transaction, TransactionIcon } from '@/core/models/transaction.model';
import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

const ICONS: Record<TransactionIcon, keyof typeof Ionicons.glyphMap> = {
  salary: 'cash-outline',
  music: 'musical-notes-outline',
  store: 'storefront-outline',
  car: 'car-outline',
  person: 'person-outline',
  coffee: 'cafe-outline',
  bag: 'bag-outline',
  refund: 'return-down-back-outline',
  bolt: 'flash-outline',
  ticket: 'ticket-outline',
};

type TransactionRowProps = {
  transaction: Transaction;
  onPress?: () => void;
};

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const theme = useTheme();
  const isIncome = transaction.amount >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { borderBottomColor: theme.colors.hairline }]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md },
        ]}
      >
        <Ionicons name={ICONS[transaction.icon]} size={18} color={theme.colors.text} />
      </View>
      <View style={styles.textGroup}>
        <AppText variant="itemTitle" numberOfLines={1}>
          {transaction.merchant}
        </AppText>
        <AppText variant="subtitle" tone="textDim" numberOfLines={1}>
          {transaction.category} · {transaction.time}
        </AppText>
      </View>
      <AppText variant="numBody" tone={isIncome ? 'up' : 'down'}>
        {isIncome ? '+' : '−'}
        {formatCurrency(Math.abs(transaction.amount))}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
