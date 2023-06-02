const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: ['jest-runner'],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  setupFiles: ['./jest.setup.js']
};
