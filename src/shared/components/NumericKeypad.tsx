import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';

export type NumericKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'backspace';

const KEYS: NumericKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

type NumericKeypadProps = {
  onKeyPress: (key: NumericKey) => void;
};

// Teclado numérico propio (3×4) para el monto de "Enviar dinero" — nunca el teclado
// nativo del sistema (ver docs/design/README.md).
export function NumericKeypad({ onKeyPress }: NumericKeypadProps) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {KEYS.map((key) => (
        <Pressable key={key} onPress={() => onKeyPress(key)} style={styles.key}>
          {key === 'backspace' ? (
            <Ionicons name="backspace-outline" size={22} color={theme.colors.text} />
          ) : (
            <AppText variant="itemTitle">{key}</AppText>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.333%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
