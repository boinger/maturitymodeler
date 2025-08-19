/**
 * Jest configuration for ES modules
 * Using .mjs extension for better ES module support
 */
export default {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/d3/**',
    '!js/require_2_3_6/**',
    '!dist/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};