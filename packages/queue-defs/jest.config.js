const jestConfig = {
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.js'
  ],
  coverageReporters: [
    'lcov',
    'json',
    'text'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  transform: {
    // Transform ES modules to CommonJS
    '^.+\\.m?js$': 'babel-jest'
  },
  silent: true
}

export default jestConfig
