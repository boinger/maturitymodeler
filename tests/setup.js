/**
 * Jest test setup file
 * Sets up global test environment and mocks
 */

import { jest, beforeEach } from '@jest/globals';

// Mock AMD define() for legacy transform.test.js
global.define = jest.fn((deps, factory) => {
  if (typeof deps === 'function') {
    // No dependencies case
    return deps();
  }
  // Mock dependencies - we'll inject real ones in tests
  const mockDeps = deps.map(dep => {
    if (dep === 'd3') {
      // Return a mock d3 object
      return {
        scaleOrdinal: jest.fn(),
        schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
        select: jest.fn(),
        selectAll: jest.fn()
      };
    }
    return {}; // Mock other dependencies
  });
  return factory(...mockDeps);
});

global.define.amd = true;

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Add common DOM elements that the app expects
beforeEach(() => {
  document.body.innerHTML = `
    <div id="body">
      <div id="title"></div>
      <div id="chart"></div>
      <div id="apps"></div>
      <div id="footer"></div>
      <div id="model"></div>
    </div>
  `;
});