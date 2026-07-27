import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { fontFamily, fontSize } from '@/theme/typography';

// TxDetail se registra tanto en HomeStack como en TransactionsStack (se puede llegar
// desde Inicio o desde Movimientos, ver docs/design/README.md). El shape de params es
// idéntico en ambos, así que basta tipar contra uno de los dos stacks.
type Props = NativeStackScreenProps<HomeStackParamList, 'TxDetail'>;

export function TxDetailScreen({ route }: Props) {
  const theme = useTheme();
  const transaction = DataService.getTransactions().find(
    (tx) => tx.id === route.params.transactionId,
  );

  if (!transaction) {
    return (
      <Screen>
        <Text style={{ color: theme.colors.text }}>Movimiento no encontrado.</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <Text
        style={[
          styles.amount,
          { color: transaction.amount >= 0 ? theme.colors.up : theme.colors.down },
        ]}
      >
        {formatCurrency(transaction.amount)}
      </Text>
      <Text style={[styles.merchant, { color: theme.colors.text }]}>{transaction.merchant}</Text>
      <Text style={{ color: theme.colors.textDim }}>
        {transaction.category} · {transaction.day} {transaction.time}
      </Text>
      <Text style={{ color: theme.colors.textMute, marginTop: 16 }}>
        Método: {transaction.method}
      </Text>
      <Text style={{ color: theme.colors.textMute }}>Referencia: {transaction.reference}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    gap: 4,
  },
  amount: {
    fontFamily: fontFamily.numBold,
    fontSize: fontSize.balanceLarge,
  },
  merchant: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: fontSize.itemTitle,
    marginTop: 8,
  },
});
