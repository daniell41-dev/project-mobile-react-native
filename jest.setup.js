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
