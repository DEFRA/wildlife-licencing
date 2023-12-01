// jest.config.js
module.exports = {
  projects: ['./packages/*/jest.config.js'],
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  transform: {
    // Transform ES modules to CommonJS
    '^.+\\.m?js$': 'babel-jest'
  },
  silent: true
}
