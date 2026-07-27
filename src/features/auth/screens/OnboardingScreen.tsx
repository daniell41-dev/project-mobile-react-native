import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <Screen style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Índigo</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textDim }]}>
        Tu banca personal, a tu manera.
      </Text>
      <Button label="Crear cuenta" onPress={() => navigation.navigate('Login')} />
      <Button
        label="Ya tengo cuenta"
        variant="outline"
        onPress={() => navigation.navigate('Login')}
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
    fontSize: fontSize.balanceLarge,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.uiRegular,
    fontSize: fontSize.body,
    textAlign: 'center',
    marginBottom: 24,
  },
});
