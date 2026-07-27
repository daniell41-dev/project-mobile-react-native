import fs from 'fs';
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

    const headerPath = `${IOS_TARGET_SUBDIR}/IndigoDevice.h`;
    const sourcePath = `${IOS_TARGET_SUBDIR}/IndigoDevice.mm`;

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
