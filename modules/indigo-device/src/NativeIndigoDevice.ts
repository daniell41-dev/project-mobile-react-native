import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// TurboModule "bare": sin Expo Modules API, spec TS -> Codegen -> Kotlin/ObjC++ (FASE 9,
// ver docs/07-capa-nativa-kotlin-swift.md sección 4.4). getDeviceName/isTablet son
// síncronos a propósito: JSI permite llamar directo a C++/nativo sin el bridge
// asíncrono legado (ver docs/07 sección 1) — algo que Expo Modules API también hace
// por debajo, pero aquí se ve explícito porque no hay capa que lo esconda.
export interface Spec extends TurboModule {
  getDeviceName(): string;
  isTablet(): boolean;
  getBatteryLevelAsync(): Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('IndigoDevice');
