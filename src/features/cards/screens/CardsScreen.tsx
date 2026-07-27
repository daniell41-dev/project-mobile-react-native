import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { CardsStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { CardVisual } from '@/shared/components/CardVisual';
import { ListRow } from '@/shared/components/ListRow';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Props = NativeStackScreenProps<CardsStackParamList, 'Cards'>;

const MORE_OPTIONS = [
  { icon: 'keypad-outline' as const, title: 'PIN y CVV' },
  { icon: 'copy-outline' as const, title: 'Copiar datos de la tarjeta' },
  { icon: 'trending-up-outline' as const, title: 'Límites' },
  { icon: 'card-outline' as const, title: 'Solicitar tarjeta física' },
];

export function CardsScreen(_props: Props) {
  const theme = useTheme();
  const card = DataService.getCards()[0];
  const [frozen, setFrozen] = useState(card.frozen);
  const [onlinePurchases, setOnlinePurchases] = useState(card.onlinePurchasesEnabled);

  return (
    <Screen>
      <AppText variant="screenTitle" style={styles.title}>
        Tarjetas
      </AppText>

      <CardVisual card={card} frozen={frozen} />

      <View style={styles.tileRow}>
        <View
          style={[
            styles.tile,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md },
          ]}
        >
          <AppText variant="subtitle" tone="textDim">
            Saldo débito
          </AppText>
          <AppText variant="itemTitle">{formatCurrency(card.debitBalance)}</AppText>
        </View>
        <View
          style={[
            styles.tile,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md },
          ]}
        >
          <AppText variant="subtitle" tone="textDim">
            Crédito disponible
          </AppText>
          <AppText variant="itemTitle">{formatCurrency(card.creditAvailable)}</AppText>
        </View>
      </View>

      <SectionHeader title="Controles" />
      <ListRow
        title="Congelar tarjeta"
        subtitle={frozen ? 'Los pagos y retiros están bloqueados' : 'La tarjeta está activa'}
        trailing={<Switch value={frozen} onValueChange={setFrozen} />}
      />
      <ListRow
        title="Compras en línea"
        subtitle={onlinePurchases ? 'Permitidas' : 'Bloqueadas'}
        trailing={<Switch value={onlinePurchases} onValueChange={setOnlinePurchases} />}
      />

      <View style={styles.moreOptions}>
        <SectionHeader title="Más opciones" />
        {MORE_OPTIONS.map((option) => (
          <ListRow
            key={option.title}
            title={option.title}
            leading={<Ionicons name={option.icon} size={20} color={theme.colors.textDim} />}
            detail
            onPress={() => Alert.alert(option.title, 'Próximamente en Índigo.')}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  tile: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  moreOptions: {
    marginTop: 16,
  },
});
