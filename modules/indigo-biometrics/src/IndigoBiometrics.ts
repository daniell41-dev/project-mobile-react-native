import { NativeModule, requireNativeModule } from 'expo';

import { BiometricsAuthResult, BiometricsAvailability } from './IndigoBiometrics.types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- forma del scaffold oficial de create-expo-module
declare class IndigoBiometricsModule extends NativeModule<{}> {
  isAvailable(): Promise<BiometricsAvailability>;
  authenticate(reason: string): Promise<BiometricsAuthResult>;
}

export default requireNativeModule<IndigoBiometricsModule>('IndigoBiometrics');
