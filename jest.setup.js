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
