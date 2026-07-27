// AsyncStorage no tiene módulo nativo en el entorno de test (Jest no compila código
// nativo); se sustituye por la implementación en memoria oficial del paquete.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
