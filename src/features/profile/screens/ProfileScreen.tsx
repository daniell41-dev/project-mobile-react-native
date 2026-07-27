import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { ProfileStackParamList } from '@/bootstrap/navigation/types';
import { BiometricsService } from '@/core/services/biometrics.service';
import { DataService } from '@/core/services/data.service';
import { useAuthStore } from '@/core/stores/auth.store';
import { useThemeStore } from '@/core/stores/theme.store';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { ListRow } from '@/shared/components/ListRow';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { useTheme, useThemeMode } from '@/shared/hooks/useTheme';
import { BiometryType } from '@modules/indigo-biometrics/src/IndigoBiometrics.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

function comingSoon(feature: string) {
  Alert.alert(feature, 'Próximamente en Índigo.');
}

function biometryTypeLabel(type: BiometryType): string {
  switch (type) {
    case 'faceId':
      return 'Face ID';
    case 'touchId':
      return 'Touch ID';
    case 'biometric':
      return 'Biometría';
    default:
      return 'No disponible en este dispositivo';
  }
}

const BIOMETRICS_AUTH_REASON = 'Confirma tu identidad para activar el desbloqueo biométrico';

export function ProfileScreen(_props: Props) {
  const theme = useTheme();
  const mode = useThemeMode();
  const setThemePreference = useThemeStore((state) => state.setPreference);
  const logout = useAuthStore((state) => state.logout);
  const user = DataService.getUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometrics, setBiometrics] = useState<{ available: boolean; label: string }>({
    available: false,
    label: 'Comprobando disponibilidad…',
  });
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    BiometricsService.isAvailable().then(({ available, biometryType }) => {
      setBiometrics({ available, label: biometryTypeLabel(biometryType) });
    });
  }, []);

  async function handleToggleBiometrics(value: boolean) {
    if (!value) {
      setBiometricsEnabled(false);
      return;
    }

    const result = await BiometricsService.authenticate(BIOMETRICS_AUTH_REASON);
    if (result.success) {
      setBiometricsEnabled(true);
    } else {
      Alert.alert('No se pudo activar', 'No pudimos confirmar tu identidad. Intenta de nuevo.');
    }
  }

  return (
    <Screen>
      <AppText variant="screenTitle" style={styles.title}>
        Perfil
      </AppText>

      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.surface2 }]}>
          <AppText variant="itemTitle" tone="accent">
            {user.initials}
          </AppText>
        </View>
        <View style={styles.headerTextGroup}>
          <AppText variant="itemTitle" numberOfLines={1} ellipsizeMode="tail">
            {user.name}
          </AppText>
          <AppText variant="subtitle" tone="textDim" numberOfLines={1} ellipsizeMode="tail">
            {user.email}
          </AppText>
        </View>
        {user.verified && <Chip label="Verificada" color="success" />}
      </View>

      <SectionHeader title="Cuenta" />
      <ListRow
        title="Datos personales"
        leading={<Ionicons name="person-outline" size={20} color={theme.colors.textDim} />}
        detail
        onPress={() => comingSoon('Datos personales')}
      />
      <ListRow
        title="Mis cuentas y CLABE"
        subtitle={user.clabe}
        leading={<Ionicons name="wallet-outline" size={20} color={theme.colors.textDim} />}
        detail
        onPress={() => comingSoon('Mis cuentas y CLABE')}
      />
      <ListRow
        title="Seguridad y biometría"
        subtitle={biometrics.label}
        leading={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textDim} />}
        trailing={
          <Switch
            value={biometricsEnabled}
            onValueChange={handleToggleBiometrics}
            disabled={!biometrics.available}
            accessibilityLabel="Desbloqueo biométrico"
          />
        }
      />

      <View style={styles.section}>
        <SectionHeader title="Preferencias" />
        <ListRow
          title="Notificaciones"
          leading={<Ionicons name="notifications-outline" size={20} color={theme.colors.textDim} />}
          trailing={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              accessibilityLabel="Notificaciones"
            />
          }
        />
        <ListRow
          title="Modo oscuro"
          leading={<Ionicons name="moon-outline" size={20} color={theme.colors.textDim} />}
          trailing={
            <Switch
              value={mode === 'dark'}
              onValueChange={(value) => setThemePreference(value ? 'dark' : 'light')}
              accessibilityLabel="Modo oscuro"
            />
          }
        />
        <ListRow
          title="Idioma"
          subtitle="Español"
          leading={<Ionicons name="language-outline" size={20} color={theme.colors.textDim} />}
          detail
          onPress={() => comingSoon('Idioma')}
        />
        <ListRow
          title="Ayuda y soporte"
          leading={<Ionicons name="help-circle-outline" size={20} color={theme.colors.textDim} />}
          detail
          onPress={() => comingSoon('Ayuda y soporte')}
        />
      </View>

      <View style={styles.logoutSection}>
        <Button label="Cerrar sesión" variant="danger" onPress={logout} />
      </View>

      <AppText variant="label" tone="textMute" style={styles.version}>
        Índigo v0.0.1
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  section: {
    marginTop: 16,
  },
  logoutSection: {
    marginTop: 24,
  },
  version: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
