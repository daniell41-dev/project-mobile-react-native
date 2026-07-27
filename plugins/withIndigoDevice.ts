import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  ConfigPlugin,
  IOSConfig,
  withDangerousMod,
  withMainApplication,
  withPlugins,
  withXcodeProject,
  createRunOncePlugin,
} from 'expo/config-plugins';
// mergeContents no está en el barrel público de expo/config-plugins, pero sí en el
// paquete subyacente @expo/config-plugins (el mismo que expo/config-plugins re-exporta).
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

// modules/indigo-device (FASE 9) es un TurboModule "bare": no usa Expo Modules API, así
// que no hay autolinking automático. Este plugin hace a mano lo que expo-modules-autolinking
// hace solo para plugins/withIndigo.ts y los módulos de las FASES 6-8: copiar el código
// nativo dentro de android/ e ios/ (generados, gitignored) y registrarlo. Es exactamente
// el trabajo manual que existía antes de que el autolinking existiera — ver
// docs/07-capa-nativa-kotlin-swift.md sección 4.4.
//
// ⚠️ La parte de Xcode (withXcodeProject) no se ha podido verificar en este entorno: no
// hay Mac/Xcode para confirmar que el árbol .pbxproj queda correcto. Ver la nota en docs/07.

const ANDROID_PACKAGE_PATH = 'dev/daniell/indigo/modules/device';
const ANDROID_SOURCE_DIR = 'modules/indigo-device/android/src/main/java/dev/daniell/indigo/modules/device';
const ANDROID_TEST_SOURCE_DIR = 'modules/indigo-device/android/src/test/java/dev/daniell/indigo/modules/device';
const IOS_SOURCE_DIR = 'modules/indigo-device/ios';
const IOS_TARGET_SUBDIR = 'IndigoDevice';

// Solo copia archivos de nivel superior a propósito: ios/Tests (XCTest) se queda en
// modules/ para cuando se conecte un target de test real (FASE 11), no se mete en el
// target de la app.
function copyDirSync(from: string, to: string) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from)) {
    const entryPath = path.join(from, entry);
    if (fs.statSync(entryPath).isFile()) {
      fs.copyFileSync(entryPath, path.join(to, entry));
    }
  }
}

const CODEGEN_SPEC_PACKAGE_PATH = 'com/facebook/fbreact/specs';
const CODEGEN_SPEC_FILE_NAME = 'NativeIndigoDeviceSpec.java';

// FASE 11, descubierto real en CI (android.yml): a diferencia de los módulos de las
// FASES 6-8 (Expo Modules, autolinkeados de verdad por expo-modules-autolinking),
// Gradle alimenta Codegen para :app a través del mismo comando de autolinking que arma
// ios/Podfile (expo-modules-autolinking react-native-config --json) -- y ese comando NO
// expone el codegenConfig del propio package.json raíz de la app (solo el de paquetes en
// node_modules). :app:generateCodegenArtifactsFromSchema corre en CI pero no genera
// NativeIndigoDeviceSpec, y compileDebugKotlin falla con "Unresolved reference". Probar
// EXPO_USE_COMMUNITY_AUTOLINKING=1 (el escape hatch documentado en settings.gradle) se
// descartó: verificado localmente que ese modo usa `@react-native-community/cli config`
// puro, que en este proyecto Expo devuelve `dependencies: {}` -- rompería el codegen de
// react-native-svg/safe-area-context/async-storage, mucho peor que el problema original.
//
// La corrección genera el spec a mano, con el mismo script Node que ya validó la FASE 9
// localmente (generate-codegen-artifacts.js, sin necesitar Android SDK), y copia
// solamente el .java de IndigoDeviceSpec directo al árbol de :app -- el resto de specs
// que ese script también genera (de librerías que YA autolinkean bien) se descartan.
function generateIndigoDeviceCodegenSpec(projectRoot: string, platformProjectRoot: string) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'indigo-device-codegen-'));
  try {
    execFileSync(
      process.execPath,
      [
        path.join(projectRoot, 'node_modules/react-native/scripts/generate-codegen-artifacts.js'),
        '-p',
        projectRoot,
        '-t',
        'android',
        '-o',
        outDir,
      ],
      { stdio: 'inherit' },
    );

    const generated = path.join(
      outDir,
      'android/app/build/generated/source/codegen/java',
      CODEGEN_SPEC_PACKAGE_PATH,
      CODEGEN_SPEC_FILE_NAME,
    );
    const destDir = path.join(platformProjectRoot, 'app/src/main/java', CODEGEN_SPEC_PACKAGE_PATH);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(generated, path.join(destDir, CODEGEN_SPEC_FILE_NAME));
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

const withIndigoDeviceAndroidSources: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    'android',
    (config) => {
      const from = path.join(config.modRequest.projectRoot, ANDROID_SOURCE_DIR);
      const to = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java',
        ANDROID_PACKAGE_PATH,
      );
      copyDirSync(from, to);

      // El JUnit de este módulo (IndigoDeviceModuleTest.kt) vive en modules/ junto al
      // resto del código -- a diferencia del lado iOS (donde Tests/ se deja fuera a
      // propósito, ver docs/07 sección 4.6), :app SÍ tiene su propio source set
      // src/test/java/ por ser un módulo Gradle normal, así que copiarlo ahí es
      // suficiente para que ./gradlew test lo recoja, sin necesitar un módulo separado.
      const testFrom = path.join(config.modRequest.projectRoot, ANDROID_TEST_SOURCE_DIR);
      const testTo = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/test/java',
        ANDROID_PACKAGE_PATH,
      );
      if (fs.existsSync(testFrom)) {
        copyDirSync(testFrom, testTo);
      }

      generateIndigoDeviceCodegenSpec(
        config.modRequest.projectRoot,
        config.modRequest.platformProjectRoot,
      );
      return config;
    },
  ]);

const withIndigoDeviceMainApplication: ConfigPlugin = (config) =>
  withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    contents = mergeContents({
      src: contents,
      newSrc: 'import dev.daniell.indigo.modules.device.IndigoDevicePackage',
      tag: 'indigo-device-import',
      anchor: /^import com\.facebook\.react\.PackageList$/m,
      offset: 1,
      comment: '//',
    }).contents;

    contents = mergeContents({
      src: contents,
      newSrc: '          add(IndigoDevicePackage())',
      tag: 'indigo-device-package',
      anchor: /PackageList\(this\)\.packages\.apply \{/,
      offset: 1,
      comment: '          //',
    }).contents;

    config.modResults.contents = contents;
    return config;
  });

const withIndigoDeviceIosSources: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const from = path.join(config.modRequest.projectRoot, IOS_SOURCE_DIR);
      const sourceRoot = IOSConfig.Paths.getSourceRoot(config.modRequest.projectRoot);
      const to = path.join(sourceRoot, IOS_TARGET_SUBDIR);
      copyDirSync(from, to);
      return config;
    },
  ]);

const withIndigoDeviceXcodeProject: ConfigPlugin = (config) =>
  withXcodeProject(config, (config) => {
    const project = config.modResults;
    const sourceRoot = IOSConfig.Paths.getSourceRoot(config.modRequest.projectRoot);
    const groupName = path.basename(sourceRoot);
    const groupKey = project.findPBXGroupKey({ name: groupName });
    const target = project.getFirstTarget().uuid;

    // El grupo "ndigo" encontrado arriba no tiene su propio `path` en el .pbxproj (solo
    // `name`) -- es un grupo "virtual", así que el path de cada archivo hijo se resuelve
    // relativo al proyecto (ios/), no a ios/ndigo/. Por eso TODOS los demás archivos del
    // grupo (AppDelegate.swift, Info.plist, ...) llevan el prefijo "ndigo/" en su propio
    // `path` -- confirmado inspeccionando el .pbxproj real generado por expo prebuild.
    // Sin ese prefijo, xcodebuild busca el archivo en ios/IndigoDevice/... en vez de
    // ios/ndigo/IndigoDevice/... (donde withIndigoDeviceIosSources lo copió de verdad) y
    // falla con "Build input file cannot be found" -- confirmado real en CI (ios.yml).
    const headerPath = `${groupName}/${IOS_TARGET_SUBDIR}/IndigoDevice.h`;
    const sourcePath = `${groupName}/${IOS_TARGET_SUBDIR}/IndigoDevice.mm`;

    if (groupKey) {
      if (!project.hasFile(headerPath)) {
        project.addHeaderFile(headerPath, { target }, groupKey);
      }
      if (!project.hasFile(sourcePath)) {
        project.addSourceFile(sourcePath, { target }, groupKey);
      }
    }

    return config;
  });

const withIndigoDevice: ConfigPlugin = (config) =>
  withPlugins(config, [
    withIndigoDeviceAndroidSources,
    withIndigoDeviceMainApplication,
    withIndigoDeviceIosSources,
    withIndigoDeviceXcodeProject,
  ]);

export default createRunOncePlugin(withIndigoDevice, 'withIndigoDevice', '1.0.0');
