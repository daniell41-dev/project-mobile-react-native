import { registerWebModule, NativeModule } from 'expo';

import { ConnectivityState, IndigoConnectivityEvents } from './IndigoConnectivity.types';

// A diferencia de los stubs "no disponible" de las FASES 6-7, el navegador sí tiene una
// señal real de conectividad (navigator.onLine + eventos online/offline de window), así
// que este fallback web es funcional: emite onConnectivityChange igual que el lado nativo,
// no un valor fijo.
class IndigoConnectivityModule extends NativeModule<IndigoConnectivityEvents> {
  async getCurrentState(): Promise<ConnectivityState> {
    return currentWebConnectivityState();
  }
}

function currentWebConnectivityState(): ConnectivityState {
  const isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
  // El navegador no expone el tipo de transporte de forma fiable/estándar (Network
  // Information API es experimental y no está en todos los navegadores) — "unknown" es
  // honesto en vez de adivinar wifi/cellular.
  return { isConnected, type: isConnected ? 'unknown' : 'none' };
}

// registerWebModule() en realidad devuelve una instancia (ver expo-modules-core/src/
// registerWebModule.ts), pero su firma la tipa como `ModuleType` (el tipo de la propia
// clase/constructor) — un desajuste conocido de expo-modules-core. Sin este cast, TS trata
// el resultado como si fuera la clase en sí y `.emit(...)` (un método de instancia) no
// tipa. InstanceType<> corrige el tipo hacia lo que realmente es en tiempo de ejecución.
const IndigoConnectivityModuleWeb = registerWebModule(
  IndigoConnectivityModule,
  'IndigoConnectivity',
) as unknown as InstanceType<typeof IndigoConnectivityModule>;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    IndigoConnectivityModuleWeb.emit('onConnectivityChange', currentWebConnectivityState());
  });
  window.addEventListener('offline', () => {
    IndigoConnectivityModuleWeb.emit('onConnectivityChange', currentWebConnectivityState());
  });
}

export default IndigoConnectivityModuleWeb;
