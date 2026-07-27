import IndigoConnectivity from '@modules/indigo-connectivity/src/IndigoConnectivity';
import { ConnectivityState } from '@modules/indigo-connectivity/src/IndigoConnectivity.types';

// Facade sobre el módulo nativo (modules/indigo-connectivity, FASE 10). subscribe() envuelve
// addListener/EventSubscription.remove() (API de expo-modules-core) en una función de
// desuscripción simple, para que los consumidores (p. ej. useConnectivity) no necesiten
// conocer el tipo EventSubscription.
export const ConnectivityService = {
  getCurrentState: (): Promise<ConnectivityState> => IndigoConnectivity.getCurrentState(),
  subscribe: (listener: (state: ConnectivityState) => void): (() => void) => {
    const subscription = IndigoConnectivity.addListener('onConnectivityChange', listener);
    return () => subscription.remove();
  },
};
