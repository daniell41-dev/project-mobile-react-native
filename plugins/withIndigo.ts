import {
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
  withPlugins,
  createRunOncePlugin,
} from 'expo/config-plugins';

// Permisos que van a necesitar los módulos nativos de las FASES 6+ (biometría vía
// androidx.biometric / LocalAuthentication, cámara para el futuro escáner de QR/CLABE).
// Se piden aquí, en un config plugin propio, en vez de dejar que cada módulo nativo
// toque el manifest/plist por su cuenta — un solo lugar versionado en plugins/, no en
// android/ ni ios/ (que son generados y se pierden en cada `expo prebuild`).

const ANDROID_PERMISSIONS = [
  'android.permission.CAMERA',
  'android.permission.USE_BIOMETRIC',
  // modules/indigo-connectivity (FASE 10): requerido para que ConnectivityManager
  // devuelva NetworkCapabilities reales en vez de null.
  'android.permission.ACCESS_NETWORK_STATE',
];

const withIndigoAndroidPermissions: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const existing = manifest['uses-permission'] ?? [];
    const existingNames = new Set(existing.map((entry) => entry.$['android:name']));

    const missing = ANDROID_PERMISSIONS.filter((name) => !existingNames.has(name)).map(
      (name) => ({ $: { 'android:name': name } }),
    );

    manifest['uses-permission'] = [...existing, ...missing];
    return config;
  });

const withIndigoIosPermissions: ConfigPlugin = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.NSFaceIDUsageDescription =
      'Índigo usa Face ID para confirmar que eres tú antes de mostrar tu saldo y tus movimientos.';
    config.modResults.NSCameraUsageDescription =
      'Índigo usa la cámara para escanear códigos QR y CLABEs al enviar dinero.';
    return config;
  });

const withIndigo: ConfigPlugin = (config) =>
  withPlugins(config, [withIndigoAndroidPermissions, withIndigoIosPermissions]);

export default createRunOncePlugin(withIndigo, 'withIndigo', '1.0.0');
