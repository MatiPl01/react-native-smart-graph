module.exports = {
  source: 'src',
  output: 'dist',
  targets: [
    [
      'commonjs',
      {
        configFile: './babel.config.cjs.js'
      }
    ],
    [
      'module',
      {
        configFile: './babel.config.esm.js'
      }
    ]
  ]
};
