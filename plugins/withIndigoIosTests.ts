import { ConfigPlugin, withPodfile, createRunOncePlugin } from 'expo/config-plugins';
// mergeContents no está en el barrel público de expo/config-plugins, pero sí en el
// paquete subyacente @expo/config-plugins (mismo truco que plugins/withIndigoDevice.ts).
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

// FASE 11: la primera versión de este plugin usaba `use_expo_modules!(:includeTests =>
// true)` -- la opción "global" documentada en expo-modules-autolinking
// (scripts/ios/autolinking_manager.rb) para pedir los test_spec de CocoaPods de TODOS los
// módulos autolinkeados. Rompió el primer `pod install` real en CI (ios.yml): también
// activa el test_spec del propio pod `Expo` (el SDK base), que depende de
// `ExpoModulesTestCore` -- un pod interno del monorepo de Expo, no publicado ni resuelto
// en este Podfile ("[!] Unable to find a specification for `ExpoModulesTestCore`").
//
// La corrección usa el mecanismo más quirúrgico que el propio autolinking_manager.rb deja
// documentado en un comentario: "The module can already be added to the target, in which
// case we can just skip it. This allows us to add a pod before `use_expo_modules` to
// provide custom flags." Cada uno de los 4 módulos propios con test_spec se declara a mano
// con `:testspecs => ['Tests']` ANTES de `use_expo_modules!`; cuando el autolinking
// procesa esos mismos módulos más abajo, los ve ya presentes en el target y los deja tal
// cual -- el resto del SDK de Expo (incluido el propio pod `Expo`) se instala normal, sin
// test_spec, como antes de esta fase.
const INDIGO_TESTABLE_PODS: { name: string; moduleDir: string }[] = [
  { name: 'IndigoBiometrics', moduleDir: 'indigo-biometrics' },
  { name: 'IndigoSecureStore', moduleDir: 'indigo-secure-store' },
  { name: 'IndigoCardView', moduleDir: 'indigo-card-view' },
  { name: 'IndigoConnectivity', moduleDir: 'indigo-connectivity' },
];

const withIndigoIosTests: ConfigPlugin = (config) =>
  withPodfile(config, (config) => {
    const podLines = INDIGO_TESTABLE_PODS.map(
      ({ name, moduleDir }) =>
        `  pod '${name}', :path => '../modules/${moduleDir}/ios', :testspecs => ['Tests']`,
    ).join('\n');

    config.modResults.contents = mergeContents({
      src: config.modResults.contents,
      newSrc: podLines,
      tag: 'indigo-ios-test-specs',
      // El nombre real del target generado es "ndigo", no "Indigo" (gotcha de saneo de
      // caracteres no-ASCII, ver docs/07 sección 3) -- confirmado corriendo prebuild
      // localmente e inspeccionando ios/Podfile.
      anchor: /target 'ndigo' do/,
      offset: 1,
      comment: '  #',
    }).contents;

    return config;
  });

export default createRunOncePlugin(withIndigoIosTests, 'withIndigoIosTests', '2.0.0');
