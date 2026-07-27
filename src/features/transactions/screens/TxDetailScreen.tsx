import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { ListRow } from '@/shared/components/ListRow';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

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
        <AppText>Movimiento no encontrado.</AppText>
      </Screen>
    );
  }

  const isIncome = transaction.amount >= 0;

  return (
    <Screen style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.xl },
        ]}
      >
        <Ionicons
          name={isIncome ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={24}
          color={isIncome ? theme.colors.up : theme.colors.down}
        />
      </View>

      <AppText variant="balance" tone={isIncome ? 'up' : 'down'} style={styles.amount}>
        {isIncome ? '+' : '−'}
        {formatCurrency(Math.abs(transaction.amount))}
      </AppText>
      <AppText variant="itemTitle" style={styles.merchant}>
        {transaction.merchant}
      </AppText>

      <View style={styles.list}>
        <ListRow title="Estado" trailing={<Chip label="Completado" color="success" />} />
        <ListRow title="Fecha" trailing={<AppText tone="textDim">{transaction.day}, {transaction.time}</AppText>} />
        <ListRow title="Categoría" trailing={<AppText tone="textDim">{transaction.category}</AppText>} />
        <ListRow title="Método" trailing={<AppText tone="textDim">{transaction.method}</AppText>} />
        <ListRow title="Referencia" trailing={<AppText tone="textDim">{transaction.reference}</AppText>} />
        <ListRow title="Comisión" trailing={<AppText tone="textDim">{formatCurrency(0)}</AppText>} />
      </View>

      <View style={styles.actions}>
        <Button
          label="Descargar comprobante"
          variant="outline"
          onPress={() => Alert.alert('Comprobante', 'Próximamente en Índigo.')}
        />
        <Button
          label="Reportar un problema"
          variant="danger"
          onPress={() => Alert.alert('Reportar', 'Próximamente en Índigo.')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amount: {
    marginBottom: 4,
  },
  merchant: {
    marginBottom: 24,
  },
  list: {
    width: '100%',
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
});
