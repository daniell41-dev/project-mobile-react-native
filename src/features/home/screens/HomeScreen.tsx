import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { BalanceCard } from '@/shared/components/BalanceCard';
import { QuickAction } from '@/shared/components/QuickAction';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { TransactionRow } from '@/shared/components/TransactionRow';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

function comingSoon(feature: string) {
  Alert.alert(feature, 'Próximamente en Índigo.');
}

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const user = DataService.getUser();
  const recent = DataService.getRecentTransactions();
  const savingsGoal = DataService.getSavingsGoal();
  const progress = Math.min(savingsGoal.current / savingsGoal.target, 1);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.screenPadding }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.lg },
              ]}
            >
              <AppText variant="itemTitle" tone="accent">
                {user.initials}
              </AppText>
            </View>
            <AppText variant="screenTitle">Hola, {user.name.split(' ')[0]}</AppText>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            hitSlop={8}
            style={[styles.bellButton, { backgroundColor: theme.colors.surface2 }]}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
            <View style={[styles.badge, { backgroundColor: theme.colors.down }]} />
          </Pressable>
        </View>

        <BalanceCard balance={user.balance} account={user.clabe} />

        <View style={styles.quickActions}>
          <QuickAction icon="send" label="Enviar" onPress={() => navigation.navigate('Send')} />
          <QuickAction
            icon="arrow-undo-outline"
            label="Solicitar"
            onPress={() => comingSoon('Solicitar')}
          />
          <QuickAction icon="flash-outline" label="Pagar" onPress={() => comingSoon('Pagar')} />
          <QuickAction icon="qr-code-outline" label="Cobrar" onPress={() => comingSoon('Cobrar')} />
        </View>

        <SectionHeader title="Meta de ahorro" />
        <View
          style={[
            styles.goalCard,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md },
          ]}
        >
          <View style={styles.goalHeader}>
            <View
              style={[
                styles.goalIcon,
                { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md },
              ]}
            >
              <Ionicons name="airplane-outline" size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.goalTextGroup}>
              <AppText variant="itemTitle">{savingsGoal.title}</AppText>
              <AppText variant="subtitle" tone="textDim">
                {formatCurrency(savingsGoal.current)} de {formatCurrency(savingsGoal.target)}
              </AppText>
            </View>
            <AppText variant="itemTitle" tone="accent">
              {Math.round(progress * 100)}%
            </AppText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surface3 }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: theme.colors.accent },
              ]}
            />
          </View>
        </View>

        <SectionHeader
          title="Movimientos recientes"
          actionLabel="Ver todos"
          onActionPress={() => navigation.getParent()?.navigate('TransactionsTab')}
        />
      </View>

      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.screenPadding }}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onPress={() => navigation.navigate('TxDetail', { transactionId: item.id })}
          />
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
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 24,
  },
  goalCard: {
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTextGroup: {
    flex: 1,
    gap: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
