import { Alert } from 'react-native';

import { Card } from '@/core/models/card.model';
import { useTheme } from '@/shared/hooks/useTheme';
import { balanceCardGradient } from '@/theme/tokens';
import { IndigoCardView } from '@modules/indigo-card-view/src/IndigoCardView';

type CardVisualProps = {
  card: Card;
  frozen: boolean;
};

// Adaptador delgado sobre la vista nativa bajo Fabric (Jetpack Compose en Android,
// SwiftUI en iOS — modules/indigo-card-view, FASE 8). Mantiene la misma superficie de
// props que tenía la versión 100% RN de la FASE 3 (ver docs/04-roadmap-y-fases.md).
export function CardVisual({ card, frozen }: CardVisualProps) {
  const theme = useTheme();

  return (
    <IndigoCardView
      holderName={card.holder}
      last4={card.last4}
      frozen={frozen}
      accentColor={balanceCardGradient[0]}
      onPress={() =>
        Alert.alert(
          'Tarjeta',
          `Índigo ${card.type === 'debit' ? 'Débito' : 'Crédito'} terminada en ${card.last4}.`,
        )
      }
      style={[{ aspectRatio: 1.6, borderRadius: theme.radii.lg }, theme.shadow]}
    />
  );
}
