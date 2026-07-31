const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*', 'node_modules/*', 'docs/**'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['jest.setup.js', 'jest.config.js', 'babel.config.js'],
    languageOptions: {
      globals: { jest: 'readonly', module: 'readonly', require: 'readonly' },
    },
  },
]);
