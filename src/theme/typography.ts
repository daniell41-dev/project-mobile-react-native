// Tipografía de Índigo: Plus Jakarta Sans (UI) + Sora (montos, tabular-nums).
// Los pesos se cargan como familias de fuente independientes (expo-font no soporta
// fontWeight variable sobre una sola familia en todas las plataformas).

export const fontFamily = {
  uiRegular: 'PlusJakartaSans_400Regular',
  uiMedium: 'PlusJakartaSans_500Medium',
  uiSemiBold: 'PlusJakartaSans_600SemiBold',
  uiBold: 'PlusJakartaSans_700Bold',
  uiExtraBold: 'PlusJakartaSans_800ExtraBold',
  numRegular: 'Sora_400Regular',
  numSemiBold: 'Sora_600SemiBold',
  numBold: 'Sora_700Bold',
} as const;

export const fontSize = {
  balanceLarge: 38,
  sendAmount: 52,
  screenTitle: 21,
  itemTitle: 15,
  subtitle: 12.5,
  label: 12,
  body: 14,
} as const;
