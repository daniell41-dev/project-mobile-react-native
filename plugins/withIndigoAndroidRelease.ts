import { ConfigPlugin, withAppBuildGradle, createRunOncePlugin } from 'expo/config-plugins';
// mergeContents no está en el barrel público de expo/config-plugins, pero sí en el
// paquete subyacente @expo/config-plugins (mismo truco que plugins/withIndigoDevice.ts).
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

// FASE 11: por defecto, la plantilla de Expo firma el buildType "release" con el mismo
// keystore de debug ("signingConfig signingConfigs.debug", ver android/app/build.gradle
// generado) — sirve para desarrollar, nunca para publicar. android/ se regenera en cada
// `expo prebuild` (CNG), así que un keystore real no puede referenciarse ahí a mano: hay
// que inyectar el signingConfig aquí, en el config plugin versionado.
//
// El keystore en sí NUNCA vive en el repo. .github/workflows/android.yml (job manual,
// workflow_dispatch) lo decodifica desde un secret base64 a android/app/release.keystore
// y escribe las 4 propiedades INDIGO_RELEASE_* en android/gradle.properties antes de
// invocar Gradle. Sin esas propiedades (build normal de CI/local), `hasProperty(...)` es
// false y el signingConfig cae al keystore de debug — comportamiento idéntico al que traía
// la plantilla, cero cambio para quien no tiene el secret.
const RELEASE_SIGNING_CONFIG = `        release {
            if (project.hasProperty('INDIGO_RELEASE_STORE_FILE')) {
                storeFile file(INDIGO_RELEASE_STORE_FILE)
                storePassword INDIGO_RELEASE_STORE_PASSWORD
                keyAlias INDIGO_RELEASE_KEY_ALIAS
                keyPassword INDIGO_RELEASE_KEY_PASSWORD
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`;

const withIndigoAndroidRelease: ConfigPlugin = (config) =>
  withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    contents = mergeContents({
      src: contents,
      newSrc: RELEASE_SIGNING_CONFIG,
      tag: 'indigo-release-signing-config',
      anchor: /signingConfigs \{/,
      offset: 1,
      comment: '        //',
    }).contents;

    // La plantilla de Expo apunta buildTypes.release al keystore de debug a propósito
    // ("Caution! In production, you need to generate your own keystore file") — justo el
    // signingConfig que el bloque de arriba reemplaza. Solo se toca esa línea dentro de
    // buildTypes { release { ... } }, no la de buildTypes { debug { ... } } (misma línea
    // literal, distinto bloque).
    contents = contents.replace(
      /(release \{\n\s*\/\/ Caution![^\n]*\n\s*\/\/ see[^\n]*\n\s*)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release',
    );

    config.modResults.contents = contents;
    return config;
  });

export default createRunOncePlugin(withIndigoAndroidRelease, 'withIndigoAndroidRelease', '1.0.0');
