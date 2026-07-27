import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/core/models/card.model';
import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';
import { balanceCardGradient } from '@/theme/tokens';

type CardVisualProps = {
  card: Card;
};

// Placeholder RN puro. En la FASE 8 se sustituye por una vista nativa bajo Fabric
// (Jetpack Compose en Android, SwiftUI en iOS — modules/indigo-card-view), manteniendo
// la misma superficie de props (ver docs/04-roadmap-y-fases.md).
export function CardVisual({ card }: CardVisualProps) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={balanceCardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: theme.radii.lg }, theme.shadow]}
    >
      <View style={styles.topRow}>
        <View style={styles.chip} />
        <Ionicons
          name={card.network === 'visa' ? 'card' : 'card-outline'}
          size={22}
          color="rgba(255,255,255,0.9)"
        />
      </View>
      <AppText variant="itemTitle" tone="onAccent" style={styles.number}>
        ···· ···· ···· {card.last4}
      </AppText>
      <View style={styles.bottomRow}>
        <View>
          <AppText variant="label" tone="onAccent" style={styles.dim}>
            Titular
          </AppText>
          <AppText variant="itemTitle" tone="onAccent">
            {card.holder}
          </AppText>
        </View>
        <AppText variant="label" tone="onAccent" style={styles.dim}>
          {card.type === 'debit' ? 'Débito' : 'Crédito'}
        </AppText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 24,
    aspectRatio: 1.6,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    width: 34,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  number: {
    letterSpacing: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dim: {
    opacity: 0.75,
  },
});
