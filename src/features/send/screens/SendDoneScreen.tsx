import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Props = NativeStackScreenProps<HomeStackParamList, 'SendDone'>;

export function SendDoneScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { amount, recipientName } = route.params;

  return (
    <Screen style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: `${theme.colors.up}22`, borderRadius: theme.radii.xl },
        ]}
      >
        <Ionicons name="checkmark-circle" size={48} color={theme.colors.up} />
      </View>

      <AppText variant="screenTitle" style={styles.title}>
        ¡Enviado!
      </AppText>
      <AppText variant="body" tone="textDim" style={styles.message}>
        Enviaste {formatCurrency(amount)} a {recipientName}
      </AppText>

      <Chip label="SPEI · llega en segundos" color="success" />

      <View style={styles.action}>
        <Button
          label="Volver al inicio"
          onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Home' }))}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 12,
  },
  action: {
    marginTop: 32,
    alignSelf: 'stretch',
  },
});
