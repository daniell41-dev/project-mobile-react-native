import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';

import { CardsStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<CardsStackParamList, 'Cards'>;

// Shell de la FASE 1. El CardVisual nativo (Compose/SwiftUI, modules/indigo-card-view)
// llega en la FASE 8 — aquí es un placeholder plano con los mismos datos.
export function CardsScreen(_props: Props) {
  const theme = useTheme();
  const card = DataService.getCards()[0];
  const [frozen, setFrozen] = useState(card.frozen);
  const [onlinePurchases, setOnlinePurchases] = useState(card.onlinePurchasesEnabled);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Tarjetas</Text>

      <View
        style={[
          styles.cardVisual,
          { backgroundColor: theme.colors.accent, borderRadius: theme.radii.lg },
        ]}
      >
        <Text style={styles.cardHolder}>{card.holder}</Text>
        <Text style={styles.cardNumber}>·· {card.last4}</Text>
      </View>

      <View style={styles.tileRow}>
        <View style={[styles.tile, { backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.textDim }}>Saldo débito</Text>
          <Text style={{ color: theme.colors.text }}>{formatCurrency(card.debitBalance)}</Text>
        </View>
        <View style={[styles.tile, { backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.textDim }}>Crédito disponible</Text>
          <Text style={{ color: theme.colors.text }}>
            {formatCurrency(card.creditAvailable)}
          </Text>
        </View>
      </View>

      <View style={[styles.toggleRow, { borderBottomColor: theme.colors.hairline }]}>
        <Text style={{ color: theme.colors.text }}>Congelar tarjeta</Text>
        <Switch value={frozen} onValueChange={setFrozen} />
      </View>
      <View style={[styles.toggleRow, { borderBottomColor: theme.colors.hairline }]}>
        <Text style={{ color: theme.colors.text }}>Compras en línea</Text>
        <Switch value={onlinePurchases} onValueChange={setOnlinePurchases} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    marginVertical: 16,
  },
  cardVisual: {
    padding: 20,
    marginBottom: 16,
    gap: 24,
  },
  cardHolder: {
    color: '#FFFFFF',
    fontFamily: fontFamily.uiSemiBold,
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fontFamily.numRegular,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tile: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
