import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

import { TransactionsStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'Transactions'>;

// Shell de la FASE 1. El buscador, el filtro Todos/Ingresos/Gastos y la agrupación
// por día (SectionList sticky) llegan con la fidelidad visual de la FASE 3.
export function TransactionsScreen({ navigation }: Props) {
  const theme = useTheme();
  const transactions = DataService.getTransactions();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Movimientos</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('TxDetail', { transactionId: item.id })}
            style={[styles.row, { borderBottomColor: theme.colors.hairline }]}
          >
            <Text style={{ color: theme.colors.text }}>{item.merchant}</Text>
            <Text style={{ color: item.amount >= 0 ? theme.colors.up : theme.colors.down }}>
              {formatCurrency(item.amount)}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
