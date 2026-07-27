import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider, Metrics } from 'react-native-safe-area-context';

// react-native-safe-area-context nunca dispara `onInsetsChange` en el entorno de test
// (no hay layout nativo real), así que sin unos `initialMetrics` fijos cualquier
// <SafeAreaView>/useSafeAreaInsets() se queda sin renderizar. Estos valores son los
// mismos que usa el propio paquete como fixture de test (frame de un iPhone típico).
const TEST_SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>{ui}</SafeAreaProvider>,
    options,
  );
}
