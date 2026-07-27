import { useColorScheme } from 'react-native';

import { useThemeStore } from '@/core/stores/theme.store';
import { Theme, ThemeMode, themes } from '@/theme/themes';

export function useThemeMode(): ThemeMode {
  const preference = useThemeStore((state) => state.preference);
  const systemScheme = useColorScheme();

  if (preference === 'system') {
    return systemScheme === 'light' ? 'light' : 'dark';
  }
  return preference;
}

export function useTheme(): Theme {
  const mode = useThemeMode();
  return themes[mode];
}
