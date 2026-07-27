import { useEffect, useState } from 'react';

import { ConnectivityService } from '@/core/services/connectivity.service';
import { ConnectivityState } from '@modules/indigo-connectivity/src/IndigoConnectivity.types';

const INITIAL_STATE: ConnectivityState = { isConnected: true, type: 'unknown' };

// Lee el estado actual una vez (getCurrentState) y luego se queda suscrito a
// onConnectivityChange (callbackFlow en Kotlin, AsyncStream en Swift) mientras el
// componente esté montado. Empieza optimista (isConnected: true) para no mostrar un
// banner de "sin conexión" de golpe mientras getCurrentState() todavía resuelve.
export function useConnectivity(): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    ConnectivityService.getCurrentState().then((current) => {
      if (!cancelled) {
        setState(current);
      }
    });

    const unsubscribe = ConnectivityService.subscribe((next) => {
      if (!cancelled) {
        setState(next);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
