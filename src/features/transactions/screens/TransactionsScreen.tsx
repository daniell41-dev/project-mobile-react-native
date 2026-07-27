import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SectionList, StyleSheet, View } from 'react-native';

import { TransactionsStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { Segment } from '@/shared/components/Segment';
import { TransactionRow } from '@/shared/components/TransactionRow';
import { useTheme } from '@/shared/hooks/useTheme';
import { groupTransactionsByDay } from '@/shared/utils/groupByDay';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'Transactions'>;

const FILTERS = ['Todos', 'Ingresos', 'Gastos'] as const;
type Filter = (typeof FILTERS)[number];

export function TransactionsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  const sections = useMemo(() => {
    const all = DataService.getTransactions();
    const byType = all.filter((tx) => {
      if (filter === 'Ingresos') return tx.amount >= 0;
      if (filter === 'Gastos') return tx.amount < 0;
      return true;
    });
    const bySearch = query.trim()
      ? byType.filter((tx) => tx.merchant.toLowerCase().includes(query.trim().toLowerCase()))
      : byType;

    return groupTransactionsByDay(bySearch);
  }, [filter, query]);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.screenPadding }}>
        <AppText variant="screenTitle" style={styles.title}>
          Movimientos
        </AppText>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar movimiento" />
        <View style={styles.segmentWrap}>
          <Segment options={FILTERS} value={filter} onChange={setFilter} />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.screenPadding }}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.colors.bg }]}>
            <AppText variant="subtitle" tone="textMute">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onPress={() => navigation.navigate('TxDetail', { transactionId: item.id })}
          />
        )}
        ListEmptyComponent={
          <AppText variant="body" tone="textDim" style={styles.empty}>
            No hay movimientos que coincidan.
          </AppText>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  segmentWrap: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingVertical: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
});
