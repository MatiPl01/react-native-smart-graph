module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
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
  ],
  comments: false
};
