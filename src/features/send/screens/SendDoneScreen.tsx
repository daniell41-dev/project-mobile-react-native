import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'SendDone'>;

export function SendDoneScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { amount, recipientName } = route.params;

  return (
    <Screen style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.up }]}>¡Enviado!</Text>
      <Text style={{ color: theme.colors.text }}>
        Enviaste {formatCurrency(amount)} a {recipientName}
      </Text>
      <Button
        label="Volver al inicio"
        onPress={() =>
          navigation.dispatch(CommonActions.navigate({ name: 'Home' }))
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: fontFamily.uiExtraBold,
    fontSize: fontSize.screenTitle,
    textAlign: 'center',
  },
});
