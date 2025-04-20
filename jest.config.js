module.exports = {
  displayName: {
    name: 'Digital Typescript Library: EVENT-HANDLER',
    color: 'yellow',
  },
  'runner': 'groups',
  'preset': 'ts-jest',
  'transform': {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts'],
  'collectCoverage': true,
  'collectCoverageFrom': [
    'src/**/*.ts',
    '!**/node_modules/**',
  ],
  'testMatch': ['**/?(*.)+(spec|test).ts'],
  'roots': [
    'src',
    'tests',
  ],
  'testPathIgnorePatterns': [
    '/node_modules/',
    
  ],
  'testEnvironment': 'node',
  'coveragePathIgnorePatterns': [
    '/node_modules/',
    'src/helpers/TestServer.ts',
    // '/types/',
  ],
  'coverageThreshold': {
    'global': {
      'statements': 85,
      'branches': 85,
      'functions': 85,
      'lines': 85,
    },
  },
  'coverageReporters': [
    'json-summary',
    'text',
    'lcov'
  ],
  // 'setupFiles': [
  //   '<rootDir>/tests/helpers/populateEnvironmentVariables.ts'
  // ]
};