import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

// Shell navegable de la FASE 1: composición real de datos (DataService) y navegación,
// sin la fidelidad visual del handoff (degradado de tarjeta, ojo para ocultar saldo,
// barra de progreso animada, ...) — eso llega en la FASE 3.
export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const user = DataService.getUser();
  const recent = DataService.getRecentTransactions();
  const savingsGoal = DataService.getSavingsGoal();

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.screenPadding }}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>Hola, {user.name}</Text>
          <Pressable onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ color: theme.colors.accent }}>🔔</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.colors.accent, borderRadius: theme.radii.lg },
          ]}
        >
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(user.balance)}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Send')}
          style={[styles.quickAction, { backgroundColor: theme.colors.surface2 }]}
        >
          <Text style={{ color: theme.colors.text }}>Enviar</Text>
        </Pressable>

        <View style={[styles.goalCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.text }}>{savingsGoal.title}</Text>
          <Text style={{ color: theme.colors.textDim }}>
            {formatCurrency(savingsGoal.current)} de {formatCurrency(savingsGoal.target)}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Movimientos recientes
        </Text>
      </View>

      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.screenPadding }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('TxDetail', { transactionId: item.id })}
            style={[styles.txRow, { borderBottomColor: theme.colors.hairline }]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
  },
  balanceCard: {
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily.uiMedium,
    fontSize: fontSize.subtitle,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontFamily: fontFamily.numBold,
    fontSize: fontSize.balanceLarge,
    marginTop: 4,
  },
  quickAction: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: fontSize.itemTitle,
    marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
