module.exports = {
  branches: ['main'],
  plugins: [
    // Analyzes commit messages and
    // determines the version
    '@semantic-release/commit-analyzer',
    // Builds release notes from commit messages
    '@semantic-release/release-notes-generator',
    // Updates the version
    '@semantic-release/npm',
    [
      // Commits, tags, and pushes
      '@semantic-release/git',
      {
        assets: [
          'ios/$PROJECTNAME*/Info.plist',
          'ios/$PROJECTNAME.xcodeproj/project.pbxproj',
          'android/app/build.gradle',
          'package.json'
        ],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    // Creates the release on GitHub
    // and posts release notes
    '@semantic-release/github'
  ]
};
