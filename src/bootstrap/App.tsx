import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';

import { ThemeProvider } from '@/bootstrap/providers/ThemeProvider';
import { RootNavigator } from '@/bootstrap/navigation/RootNavigator';
import { toNavigationTheme } from '@/bootstrap/navigation/navigationTheme';
import { useTheme } from '@/shared/hooks/useTheme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  const hideSplash = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainerWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function NavigationContainerWithTheme() {
  const theme = useTheme();

  return (
    <NavigationContainer theme={toNavigationTheme(theme)}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <RootNavigator />
      </View>
    </NavigationContainer>
  );
}
