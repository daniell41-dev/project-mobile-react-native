import {
  ColorTokens,
  ShadowTokens,
  darkColors,
  lightColors,
  radii,
  shadow,
  spacing,
} from '@/theme/tokens';

export type ThemeMode = 'dark' | 'light';

export type Theme = {
  mode: ThemeMode;
  colors: ColorTokens;
  radii: typeof radii;
  spacing: typeof spacing;
  shadow: ShadowTokens;
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  radii,
  spacing,
  shadow: shadow.dark,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  radii,
  spacing,
  shadow: shadow.light,
};

export const themes: Record<ThemeMode, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};
