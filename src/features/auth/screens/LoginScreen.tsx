import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { useAuthStore } from '@/core/stores/auth.store';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// Shell de la FASE 1: el botón autentica directo. react-hook-form + zod y la
// restauración de sesión persistida llegan en la FASE 2.
export function LoginScreen(_props: Props) {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);

  return (
    <Screen style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Entrar</Text>
      <Button label="Entrar" onPress={login} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
});
