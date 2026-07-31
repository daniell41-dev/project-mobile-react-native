import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { StyleSheet, View } from 'react-native';

import { StatsStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { Segment } from '@/shared/components/Segment';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Props = NativeStackScreenProps<StatsStackParamList, 'Stats'>;

const PERIODS = ['Semana', 'Mes', 'Año'] as const;

// Charts reales (react-native-gifted-charts sobre react-native-svg). El segmento
// Semana/Mes/Año es por ahora cosmético: la data mock de DataService no varía por
// periodo — cuando exista un backend real, cada periodo pedirá su propio conjunto.
export function StatsScreen(_props: Props) {
  const theme = useTheme();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Mes');
  const categories = DataService.getSpendingCategories();
  const months = DataService.getMonthlySpending();
  const total = categories.reduce((sum, category) => sum + category.amount, 0);

  const pieData = categories.map((category) => ({
    value: category.pct,
    color: category.color,
    text: '',
  }));

  const barData = months.map((month) => ({
    value: month.value,
    label: month.month,
    frontColor: month.current ? theme.colors.accent : theme.colors.surface3,
  }));

  return (
    <Screen>
      <AppText variant="screenTitle" style={styles.title}>
        Análisis
      </AppText>

      <Segment options={PERIODS} value={period} onChange={setPeriod} />

      <AppText variant="subtitle" tone="textDim" style={styles.totalLabel}>
        Gasto total · {period}
      </AppText>

      <View style={styles.donutRow}>
        <PieChart
          data={pieData}
          donut
          radius={78}
          innerRadius={52}
          innerCircleColor={theme.colors.bg}
          centerLabelComponent={() => (
            <View style={styles.donutCenter}>
              <AppText variant="itemTitle">{formatCurrency(total)}</AppText>
              <AppText variant="label" tone="textMute">
                Total
              </AppText>
            </View>
          )}
        />

        <View style={styles.legend}>
          {categories.map((category) => (
            <View key={category.name} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <AppText variant="label" tone="textDim" style={styles.legendName} numberOfLines={1}>
                {category.name}
              </AppText>
              <AppText variant="label" tone="textDim">
                {category.pct}%
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.monthsSection}>
        <SectionHeader title="Tendencia mensual" />
        <BarChart
          data={barData}
          barWidth={18}
          spacing={20}
          roundedTop
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          hideYAxisText
          noOfSections={4}
          maxValue={1}
          height={110}
          xAxisLabelTextStyle={{ color: theme.colors.textMute, fontSize: 11 }}
        />
      </View>

      <View
        style={[
          styles.tipCard,
          { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md },
        ]}
      >
        <Ionicons name="bulb-outline" size={20} color={theme.colors.accent} />
        <AppText variant="body" tone="textDim" style={styles.tipText}>
          Tus gastos en &quot;Compras&quot; subieron este mes. Revisa tus suscripciones para
          encontrar ahorro.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  totalLabel: {
    marginTop: 20,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  donutCenter: {
    alignItems: 'center',
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendName: {
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  monthsSection: {
    marginTop: 24,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
  },
});
