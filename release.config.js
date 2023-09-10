module.exports = {
  branches: [
    { name: 'develop', prerelease: true },
    { name: 'release', prerelease: true },
    'main'
  ],
  plugins: [
    // Analyzes commit messages and
    // determines the version
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { type: 'docs', scope: 'README', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'style', release: 'patch' },
          { scope: 'no-release', release: false }
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        }
      }
    ],
    // Generates a changelog file
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    // Builds release notes from commit messages
    '@semantic-release/release-notes-generator',
    // Commits, tags, and pushes
    [
      '@semantic-release/git',
      {
        assets: [
          'dist',
          'package.json',
          'CHANGELOG.md',
          'LICENSE',
          'README.md'
        ],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    // Updates the version
    '@semantic-release/npm',
    // Creates the release on GitHub
    // and posts release notes
    '@semantic-release/github'
  ]
};
