import { registerWebModule, NativeModule } from 'expo';

import { BiometricsAuthResult, BiometricsAvailability } from './IndigoBiometrics.types';

// Face ID/Touch ID/androidx.biometric no existen en la web: stub que responde "no
// disponible" de forma consistente, para que core/services/biometrics.service.ts no
// necesite ningún caso especial por plataforma.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- forma del scaffold oficial de create-expo-module
class IndigoBiometricsModule extends NativeModule<{}> {
  async isAvailable(): Promise<BiometricsAvailability> {
    return { available: false, biometryType: 'none' };
  }

  async authenticate(_reason: string): Promise<BiometricsAuthResult> {
    return { success: false, error: 'not_available' };
  }
}

export default registerWebModule(IndigoBiometricsModule, 'IndigoBiometrics');
