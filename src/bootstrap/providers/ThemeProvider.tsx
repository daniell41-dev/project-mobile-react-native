import { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/shared/hooks/useTheme';

// El estado de tema vive en `themeStore` (Zustand) y `useTheme()` lo lee directamente —
// no hace falta un React Context para evitar prop drilling. Este provider solo aplica
// el efecto global que sí depende del árbol de componentes: el estilo de la status bar.
export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useTheme();

  return (
    <>
      {children}
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
