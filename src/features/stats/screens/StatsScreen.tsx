import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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

// El donut y las barras reales (react-native-gifted-charts) llegan en la FASE 4; aquí
// se muestra la misma data como leyenda/lista para validar que fluye correctamente.
export function StatsScreen(_props: Props) {
  const theme = useTheme();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Mes');
  const categories = DataService.getSpendingCategories();
  const months = DataService.getMonthlySpending();
  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  const maxMonthValue = Math.max(...months.map((month) => month.value));

  return (
    <Screen>
      <AppText variant="screenTitle" style={styles.title}>
        Análisis
      </AppText>

      <Segment options={PERIODS} value={period} onChange={setPeriod} />

      <View style={styles.totalBlock}>
        <AppText variant="subtitle" tone="textDim">
          Gasto total · {period}
        </AppText>
        <AppText variant="balance">{formatCurrency(total)}</AppText>
      </View>

      <SectionHeader title="Por categoría" />
      {categories.map((category) => (
        <View key={category.name} style={styles.categoryRow}>
          <View style={[styles.dot, { backgroundColor: category.color }]} />
          <AppText variant="body" style={styles.categoryName}>
            {category.name}
          </AppText>
          <AppText variant="subtitle" tone="textDim">
            {category.pct}%
          </AppText>
          <AppText variant="itemTitle" style={styles.categoryAmount}>
            {formatCurrency(category.amount)}
          </AppText>
        </View>
      ))}

      <View style={styles.monthsSection}>
        <SectionHeader title="Tendencia mensual" />
        <View style={styles.monthsRow}>
          {months.map((month) => (
            <View key={month.month} style={styles.monthColumn}>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.surface3 }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${(month.value / maxMonthValue) * 100}%`,
                      backgroundColor: month.current ? theme.colors.accent : theme.colors.surface3,
                      borderWidth: month.current ? 0 : 1,
                      borderColor: theme.colors.accent,
                    },
                  ]}
                />
              </View>
              <AppText variant="label" tone="textMute">
                {month.month}
              </AppText>
            </View>
          ))}
        </View>
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
  totalBlock: {
    marginTop: 20,
    marginBottom: 8,
    gap: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    flex: 1,
  },
  categoryAmount: {
    marginLeft: 12,
    minWidth: 76,
    textAlign: 'right',
  },
  monthsSection: {
    marginTop: 16,
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 8,
  },
  monthColumn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  barTrack: {
    width: 18,
    height: 88,
    borderRadius: 9,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 9,
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
