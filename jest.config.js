module.exports = {
  displayName: {
    name: 'Evernorth Typescript Library: aws-lambda-ts-event-handler',
    color: 'yellow',
  },
  runner: 'groups',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  roots: ['src', 'tests'],
  testPathIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/helpers/TestServer.ts',
    // '/types/',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
  coverageReporters: ['json-summary', 'text', 'lcov'],
  // 'setupFiles': [
  //   '<rootDir>/tests/helpers/populateEnvironmentVariables.ts'
  // ]

  // Fix for GitHub Actions compatibility issue
  resolver: undefined,
  // Ensure consistent module resolution in different environments
  moduleDirectories: ['node_modules'],
  // Improve error reporting
  verbose: true,
  // Add GitHub Actions reporter when running in GitHub Actions
  reporters: [
    'default',
    process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : null,
    process.env.GITHUB_ACTIONS === 'true' ? 'summary' : null,
  ].filter(Boolean),
};
