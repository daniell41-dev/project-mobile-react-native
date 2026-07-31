import { NativeModule, requireNativeModule } from 'expo';

import { ConnectivityState, IndigoConnectivityEvents } from './IndigoConnectivity.types';

// A diferencia de indigo-biometrics/indigo-secure-store (sin eventos, EventsMap vacío),
// este módulo sí declara TEventsMap: NativeModule<TEventsMap> extiende EventEmitter, así
// que addListener/removeListener/emit quedan tipados de punta a punta desde aquí.
declare class IndigoConnectivityModule extends NativeModule<IndigoConnectivityEvents> {
  getCurrentState(): Promise<ConnectivityState>;
}

export default requireNativeModule<IndigoConnectivityModule>('IndigoConnectivity');
