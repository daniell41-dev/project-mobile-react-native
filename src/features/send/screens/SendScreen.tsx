import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'Send'>;

// Shell de la FASE 1: elegir un contacto navega directo a la confirmación con un monto
// de ejemplo. El teclado numérico propio (NumericKeypad, nunca el nativo) y el monto
// real construido en vivo llegan en la FASE 3 (ver docs/design/README.md).
export function SendScreen({ navigation }: Props) {
  const theme = useTheme();
  const contacts = DataService.getContacts();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Enviar dinero</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('SendDone', { amount: 500, recipientName: item.name })
            }
            style={[styles.row, { borderBottomColor: theme.colors.hairline }]}
          >
            <Text style={{ color: theme.colors.text }}>{item.name}</Text>
            <Text style={{ color: theme.colors.textDim }}>{item.sub}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    marginVertical: 16,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
});
