import { AuthNavigator } from '@/bootstrap/navigation/AuthNavigator';
import { TabNavigator } from '@/bootstrap/navigation/TabNavigator';
import { useAuthStore } from '@/core/stores/auth.store';

// Conmuta entre el flujo pre-auth y el shell autenticado. Sin navegación imperativa:
// el árbol de navegación cambia según el estado de authStore (patrón recomendado por
// React Navigation para flujos de login, ver docs/03-arquitectura-y-buenas-practicas.md).
// `status === 'loading'` no debería llegar a montarse: App.tsx espera a
// restoreSession() antes de ocultar el splash y renderizar este navegador.
export function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  return status === 'authenticated' ? <TabNavigator /> : <AuthNavigator />;
}
