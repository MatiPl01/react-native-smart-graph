module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    'commonjs',
    [
      'module',
      {
        configFile: './babel.config.build.js'
      }
    ],
    [
      'typescript',
      {
        project: './tsconfig.build.json'
      }
    ]
  ]
};
