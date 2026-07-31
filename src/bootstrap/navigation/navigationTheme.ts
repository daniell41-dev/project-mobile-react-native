import { DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

import { Theme } from '@/theme/themes';

export function toNavigationTheme(theme: Theme): NavigationTheme {
  return {
    ...DefaultTheme,
    dark: theme.mode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.accent,
      background: theme.colors.bg,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.hairline,
      notification: theme.colors.down,
    },
  };
}
