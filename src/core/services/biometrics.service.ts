import IndigoBiometrics from '@modules/indigo-biometrics/src/IndigoBiometrics';
import {
  BiometricsAuthResult,
  BiometricsAvailability,
} from '@modules/indigo-biometrics/src/IndigoBiometrics.types';

// Facade sobre el módulo nativo (modules/indigo-biometrics): el resto de la app nunca
// importa el módulo nativo directamente, siempre a través de este servicio.
export const BiometricsService = {
  isAvailable: (): Promise<BiometricsAvailability> => IndigoBiometrics.isAvailable(),
  authenticate: (reason: string): Promise<BiometricsAuthResult> =>
    IndigoBiometrics.authenticate(reason),
};
