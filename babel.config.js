const inProduction = process.env.NODE_ENV === 'production';

module.exports = function () {
  const plugins = [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.svg', '.json'],
        alias: {
          // This needs to be mirrored in tsconfig.json
          '@': './src'
        }
      }
    ]
  ];

  if (inProduction) {
    plugins.push(['transform-remove-console']);
  }

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins
  };
};
