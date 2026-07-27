import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { useConnectivity } from '@/shared/hooks/useConnectivity';
import { useTheme } from '@/shared/hooks/useTheme';

// Montado una sola vez en la raíz de App.tsx (encima de RootNavigator): así cubre las
// 10 pantallas sin que cada una tenga que importar useConnectivity por su cuenta.
export function OfflineBanner() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useConnectivity();

  if (isConnected) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: theme.colors.down, paddingTop: insets.top + theme.spacing.xs },
      ]}
      pointerEvents="none"
    >
      <AppText variant="label" tone="onAccent">
        Sin conexión a internet
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingBottom: 6,
  },
});
