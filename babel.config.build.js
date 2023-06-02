module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            '>1%',
            'last 2 chrome versions',
            'last 2 edge versions',
            'last 2 firefox versions',
            'last 2 safari versions',
            'not dead',
            'not ie <= 11',
            'not op_mini all',
            'not android <= 4.4',
            'not samsung <= 4'
          ],
          node: '16'
        },
        useBuiltIns: false,
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
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.svg', '.json'],
        alias: {
          // This needs to be mirrored in tsconfig.json
          '@': './src'
        }
      }
    ]
  ]
};
