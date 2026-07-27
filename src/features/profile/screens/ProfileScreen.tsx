import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { ProfileStackParamList } from '@/bootstrap/navigation/types';
import { useAuthStore } from '@/core/stores/auth.store';
import { useThemeStore } from '@/core/stores/theme.store';
import { DataService } from '@/core/services/data.service';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { useTheme, useThemeMode } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen(_props: Props) {
  const theme = useTheme();
  const mode = useThemeMode();
  const setPreference = useThemeStore((state) => state.setPreference);
  const logout = useAuthStore((state) => state.logout);
  const user = DataService.getUser();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Perfil</Text>

      <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={{ color: theme.colors.text, fontFamily: fontFamily.uiSemiBold }}>
          {user.name}
        </Text>
        <Text style={{ color: theme.colors.textDim }}>{user.email}</Text>
        {user.verified && (
          <View style={[styles.chip, { backgroundColor: theme.colors.up }]}>
            <Text style={styles.chipLabel}>Verificada</Text>
          </View>
        )}
      </View>

      <View style={[styles.row, { borderBottomColor: theme.colors.hairline }]}>
        <Text style={{ color: theme.colors.text }}>Modo oscuro</Text>
        <Switch
          value={mode === 'dark'}
          onValueChange={(value) => setPreference(value ? 'dark' : 'light')}
        />
      </View>

      <Button label="Cerrar sesión" variant="outline" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    marginVertical: 16,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 4,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
  },
  chipLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.label,
    fontFamily: fontFamily.uiSemiBold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
});
