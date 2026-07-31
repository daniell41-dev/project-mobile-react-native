import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { brand } from '@/theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <LinearGradient
        colors={[`${brand.accent500}33`, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      <Screen style={styles.content}>
        <View style={styles.hero}>
          <AppText variant="balance" style={styles.brand}>
            Índigo
          </AppText>
          <AppText variant="body" tone="textDim" style={styles.subtitle}>
            Tu banca personal, a tu manera.
          </AppText>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === 0 ? theme.colors.accent : theme.colors.surface3 },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Crear cuenta" onPress={() => navigation.navigate('Login')} />
          <Button
            label="Ya tengo cuenta"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  brand: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actions: {
    gap: 12,
  },
});
