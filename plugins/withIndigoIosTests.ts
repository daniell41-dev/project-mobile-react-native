import { ConfigPlugin, withPodfile, createRunOncePlugin } from 'expo/config-plugins';

// FASE 11: `use_expo_modules!` sin argumentos (el que trae la plantilla de Expo) instala
// cada módulo autolinkeado SIN sus test_specs de CocoaPods -- xcodebuild nunca vería los
// esquemas <Módulo>-Unit-Tests que generan los `test_spec` de cada .podspec (ver
// modules/indigo-{biometrics,secure-store,card-view,connectivity}/ios/*.podspec).
// `includeTests: true` es la opción documentada de expo-modules-autolinking
// (scripts/ios/autolinking_manager.rb) para pedir justo eso, sin tocar el mecanismo de
// autolinking en sí. El Podfile se regenera entero en cada `expo prebuild`, así que no
// hace falta lógica de idempotencia más allá de createRunOncePlugin (evita aplicar el
// plugin dos veces dentro de una misma pasada).
const withIndigoIosTests: ConfigPlugin = (config) =>
  withPodfile(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      '  use_expo_modules!\n',
      '  use_expo_modules!(:includeTests => true)\n',
    );
    return config;
  });

export default createRunOncePlugin(withIndigoIosTests, 'withIndigoIosTests', '1.0.0');
