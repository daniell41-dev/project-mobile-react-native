import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { balanceCardGradient } from '@/theme/tokens';

type BalanceCardProps = {
  balance: number;
  account: string;
};

const HIDDEN_PLACEHOLDER = '$ •••••••';

export function BalanceCard({ balance, account }: BalanceCardProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(false);

  return (
    <LinearGradient
      colors={balanceCardGradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.card, { borderRadius: theme.radii.lg }, theme.shadow]}
    >
      <View style={styles.headerRow}>
        <AppText variant="subtitle" tone="onAccent" style={styles.label}>
          Saldo disponible
        </AppText>
        <Pressable
          onPress={() => setHidden((value) => !value)}
          hitSlop={8}
          accessibilityLabel={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
        >
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="rgba(255,255,255,0.85)"
          />
        </Pressable>
      </View>

      <AppText variant="balance" tone="onAccent" style={styles.amount}>
        {hidden ? HIDDEN_PLACEHOLDER : formatCurrency(balance)}
      </AppText>

      <AppText variant="label" tone="onAccent" style={styles.account}>
        {account}
      </AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    opacity: 0.85,
  },
  amount: {
    marginTop: 8,
  },
  account: {
    marginTop: 12,
    opacity: 0.75,
  },
});
