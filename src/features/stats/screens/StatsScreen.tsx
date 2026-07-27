import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { StatsStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<StatsStackParamList, 'Stats'>;

// Shell de la FASE 1. El donut y las barras (react-native-gifted-charts) llegan en la
// FASE 4 — por ahora se lista la misma data como referencia de que fluye correctamente.
export function StatsScreen(_props: Props) {
  const theme = useTheme();
  const categories = DataService.getSpendingCategories();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Análisis</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: theme.colors.hairline }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={{ color: theme.colors.text, flex: 1 }}>{item.name}</Text>
            <Text style={{ color: theme.colors.textDim }}>{item.pct}%</Text>
            <Text style={{ color: theme.colors.text, marginLeft: 12 }}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
