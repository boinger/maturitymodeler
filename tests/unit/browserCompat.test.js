/**
 * Tests for browser compatibility detection
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Browser Compatibility', () => {
  let browserCompat;

  beforeEach(async () => {
    document.body.textContent = '';
    browserCompat = await import('../../js/utils/browserCompat.js');
  });

  afterEach(() => {
    const warnings = document.querySelectorAll('[style*="background: #fff3cd"]');
    warnings.forEach(warning => warning.remove());
  });

  describe('Feature Detection', () => {
    test('supportsESModules should return a boolean', () => {
      // jsdom lacks noModule on <script>, so this may return false in test env
      expect(typeof browserCompat.supportsESModules()).toBe('boolean');
    });

    test('supportsAsyncAwait should return true in modern Node', () => {
      expect(browserCompat.supportsAsyncAwait()).toBe(true);
    });

    test('supportsArrowFunctions should return true in modern Node', () => {
      expect(browserCompat.supportsArrowFunctions()).toBe(true);
    });

    test('should return a complete compatibility object with all expected keys', () => {
      const compat = browserCompat.getBrowserCompatibility();

      expect(compat).toHaveProperty('esModules');
      expect(compat).toHaveProperty('asyncAwait');
      expect(compat).toHaveProperty('arrowFunctions');
      expect(compat).toHaveProperty('fetch');
      expect(compat).toHaveProperty('promise');
      expect(compat).toHaveProperty('symbol');

      // Promise and Symbol are available in Node/jsdom
      expect(compat.promise).toBe(true);
      expect(compat.symbol).toBe(true);
    });
  });

  describe('Compatibility Checking', () => {
    test('should run without throwing', () => {
      expect(() => browserCompat.checkBrowserCompatibility()).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('feature detection should complete in under 50ms', () => {
      const start = performance.now();
      browserCompat.getBrowserCompatibility();
      expect(performance.now() - start).toBeLessThan(50);
    });
  });
});
