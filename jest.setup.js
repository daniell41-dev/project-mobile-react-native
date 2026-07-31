// AsyncStorage no tiene módulo nativo en el entorno de test (Jest no compila código
// nativo); se sustituye por la implementación en memoria oficial del paquete.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// modules/indigo-biometrics tampoco tiene módulo nativo en Jest (no hay Android/iOS real
// compilado); se sustituye por el mismo stub "no disponible" que ya usa la plataforma
// web (ver modules/indigo-biometrics/src/IndigoBiometrics.web.ts).
jest.mock('@modules/indigo-biometrics/src/IndigoBiometrics', () => ({
  __esModule: true,
  default: {
    isAvailable: jest.fn().mockResolvedValue({ available: false, biometryType: 'none' }),
    authenticate: jest.fn().mockResolvedValue({ success: false, error: 'not_available' }),
  },
}));

// modules/indigo-secure-store tampoco tiene módulo nativo en Jest: se sustituye por un
// almacén en memoria (mismo contrato que Keystore/Keychain). Cada archivo de test
// arranca con un registro de módulos nuevo (Jest lo resetea entre archivos), así que
// este Map ya nace vacío en cada suite — no hace falta limpiarlo a mano.
const mockSecureStore = new Map();

jest.mock('@modules/indigo-secure-store/src/IndigoSecureStore', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key) => Promise.resolve(mockSecureStore.get(key) ?? null)),
    setItem: jest.fn((key, value) => {
      mockSecureStore.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      mockSecureStore.delete(key);
      return Promise.resolve();
    }),
  },
}));

// modules/indigo-device es un TurboModule "bare" (sin Expo Modules API): no tiene el
// registerWebModule/mock automático de los otros módulos, así que TurboModuleRegistry
// .getEnforcing revienta en Jest igual que en la plataforma web (ver
// modules/indigo-device/src/NativeIndigoDevice.web.ts, el mismo stub se usa aquí).
jest.mock('@modules/indigo-device/src/NativeIndigoDevice', () => ({
  __esModule: true,
  default: {
    getDeviceName: jest.fn(() => 'Navegador web'),
    isTablet: jest.fn(() => false),
    getBatteryLevelAsync: jest.fn().mockResolvedValue(-1),
  },
}));

// modules/indigo-connectivity (FASE 10) tampoco tiene módulo nativo en Jest. A diferencia
// de los mocks anteriores, este expone addListener/removeListener (NativeModule<TEventsMap>
// extiende EventEmitter) porque connectivity.service.ts y useConnectivity los usan —
// removeListener despacha a la desuscripción, igual que haría el EventEmitter real.
jest.mock('@modules/indigo-connectivity/src/IndigoConnectivity', () => {
  const listeners = new Set();
  return {
    __esModule: true,
    default: {
      getCurrentState: jest.fn().mockResolvedValue({ isConnected: true, type: 'unknown' }),
      addListener: jest.fn((_eventName, listener) => {
        listeners.add(listener);
        return { remove: () => listeners.delete(listener) };
      }),
      removeListener: jest.fn((_eventName, listener) => {
        listeners.delete(listener);
      }),
    },
  };
});
