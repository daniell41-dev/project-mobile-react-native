module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/dist/'],
  setupFiles: ['./jest.setup.js'],
  // El preset de jest-expo solo transforma un whitelist fijo de paquetes RN/Expo.
  // react-native-gifted-charts (vía gifted-charts-core) se publica como ESM puro y
  // necesita pasar por Babel también.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|react-native-svg|react-native-gifted-charts|gifted-charts-core))',
  ],
};
