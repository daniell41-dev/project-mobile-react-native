import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IndigoCardViewProps } from './IndigoCardView.types';

// Las vistas Fabric (ComposeView/UIHostingController) no existen en React Native Web:
// este es un fallback en RN puro con la misma superficie de props, solo para que la
// demo web (pnpm build:web) siga funcionando — no es el render nativo real, ver
// docs/07-capa-nativa-kotlin-swift.md sección 4.3.
export function IndigoCardView({
  holderName,
  last4,
  frozen,
  accentColor,
  onPress,
  style,
}: IndigoCardViewProps) {
  const colors: [string, string] = accentColor ? [accentColor, accentColor] : ['#820AD1', '#5B0796'];

  return (
    <Pressable onPress={() => onPress?.({ nativeEvent: {} } as never)}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
        <Text style={styles.number}>···· ···· ···· {last4}</Text>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.dim}>Titular</Text>
            <Text style={styles.holder}>{holderName}</Text>
          </View>
          {frozen && <Text style={styles.holder}>CONGELADA</Text>}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    justifyContent: 'space-between',
  },
  number: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dim: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  holder: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
