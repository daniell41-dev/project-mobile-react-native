// Design tokens de Índigo. Fuente de verdad de color: docs/design/README.md
// (paleta morada — reemplaza el azul del prototipo original de Nimbo).

export const brand = {
  accent500: '#820AD1',
  accent400: '#A855F7',
  accent600: '#6A08AC',
} as const;

export const balanceCardGradient = ['#820AD1', '#5B0A93', '#33055A'] as const;

export type ColorTokens = {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  hairline: string;
  text: string;
  textDim: string;
  textMute: string;
  accent: string;
  up: string;
  down: string;
};

export const darkColors: ColorTokens = {
  bg: '#0B0810',
  surface: '#16111D',
  surface2: '#1E1828',
  surface3: '#271F33',
  hairline: 'rgba(255,255,255,0.075)',
  text: '#F1EEF6',
  textDim: '#A79FB3',
  textMute: '#6E657C',
  accent: brand.accent400,
  up: '#3FD1A0',
  down: '#FF8A8A',
};

export const lightColors: ColorTokens = {
  bg: '#F2EFF7',
  surface: '#FFFFFF',
  surface2: '#F7F4FB',
  surface3: '#EDE8F5',
  hairline: 'rgba(22,16,31,0.08)',
  text: '#16101F',
  textDim: '#63596F',
  textMute: '#938AA0',
  accent: brand.accent500,
  up: '#128C5E',
  down: '#D2453C',
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export const spacing = {
  screenPadding: 20,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const hitSlop = { minHeight: 44, minWidth: 44 } as const;

export type ShadowTokens = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const shadow: { dark: ShadowTokens; light: ShadowTokens } = {
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  light: {
    shadowColor: '#14285A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
};
