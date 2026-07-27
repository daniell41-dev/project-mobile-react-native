module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/dist/'],
  setupFiles: ['./jest.setup.js'],
};
