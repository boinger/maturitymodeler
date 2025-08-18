/**
 * Integration tests for ES module conversion
 * Tests that all modules can be imported and work together
 */

import { describe, test, expect } from '@jest/globals';

describe('ES Module Integration', () => {
  test('should be able to import data module', async () => {
    // Dynamic import to test ES module loading
    const dataModule = await import('../../js/data/data_radar.js');
    
    expect(dataModule.default).toBeDefined();
    expect(dataModule.default.pageTitle).toBeDefined();
    expect(dataModule.default.categories).toBeDefined();
    expect(Array.isArray(dataModule.default.categories)).toBe(true);
    expect(dataModule.default.maturityData).toBeDefined();
    expect(Array.isArray(dataModule.default.maturityData)).toBe(true);
  });

  test('should be able to import transform module', async () => {
    const transformModule = await import('../../js/radar/transform.js');
    
    expect(transformModule.default).toBeDefined();
    expect(typeof transformModule.default.transformScale).toBe('function');
    expect(typeof transformModule.default.getAppNames).toBe('function');
    expect(typeof transformModule.default.getSelectedData).toBe('function');
  });

  test('should be able to import radar module', async () => {
    const radarModule = await import('../../js/radar/radar.js');
    
    expect(radarModule.default).toBeDefined();
    expect(typeof radarModule.default.draw).toBe('function');
    expect(typeof radarModule.default.getColorScale).toBe('function');
    
    // Test that color scale works in test environment (fallback mode)
    const colorScale = radarModule.default.getColorScale();
    expect(colorScale).toBeDefined();
    expect(typeof colorScale).toBe('function');
  });

  test('transform functions should work with imported data', async () => {
    const dataModule = await import('../../js/data/data_radar.js');
    const transformModule = await import('../../js/radar/transform.js');
    
    // Test that transform functions work with real data
    const appNames = transformModule.default.getAppNames();
    expect(Array.isArray(appNames)).toBe(true);
    expect(appNames.length).toBeGreaterThan(0);
    
    // Test transform scale function
    const transformed = transformModule.default.transformScale(1);
    expect(transformed).toBe(60); // 1 * 20 + 40
  });

  test('color scale should be accessible from radar module', async () => {
    const radarModule = await import('../../js/radar/radar.js');
    
    const colorScale = radarModule.default.getColorScale();
    expect(colorScale).toBeDefined();
    expect(typeof colorScale).toBe('function');
    
    // Test that color scale returns valid colors (using fallback in test env)
    const color0 = colorScale(0);
    const color1 = colorScale(1);
    
    expect(typeof color0).toBe('string');
    expect(typeof color1).toBe('string');
    expect(color0).not.toBe(color1); // Should be different colors
    expect(color0).toMatch(/^#[0-9a-fA-F]{6}$/); // Should be hex color
  });

  test('modules should export both named and default exports', async () => {
    // Test data module exports
    const dataModule = await import('../../js/data/data_radar.js');
    expect(dataModule.categories).toBeDefined();
    expect(dataModule.maturityData).toBeDefined();
    expect(dataModule.default).toBeDefined();
    
    // Test transform module exports  
    const transformModule = await import('../../js/radar/transform.js');
    expect(transformModule.transformScale).toBeDefined();
    expect(transformModule.getAppNames).toBeDefined();
    expect(transformModule.default).toBeDefined();
    
    // Test radar module exports (note: radar uses fallback mode in tests)
    const radarModule = await import('../../js/radar/radar.js');
    expect(radarModule.draw).toBeDefined();
    expect(radarModule.getColorScale).toBeDefined();
    expect(radarModule.default).toBeDefined();
  });

  test('should handle module dependency chain', async () => {
    // This tests that the full module dependency chain works:
    // setup.js -> [dataRadar, transform, radar] -> [dataRadar, d3]
    
    // We can't fully test setup.js in Jest because it manipulates DOM on import,
    // but we can test that the dependencies it needs are all importable
    const dataModule = await import('../../js/data/data_radar.js');
    const transformModule = await import('../../js/radar/transform.js');
    const radarModule = await import('../../js/radar/radar.js');
    
    // Verify that each module exports what the others need
    expect(dataModule.default.maturityData).toBeDefined();
    expect(transformModule.default.getSelectedData).toBeDefined();
    expect(radarModule.default.draw).toBeDefined();
    
    // Test a realistic workflow
    const selectedData = transformModule.default.getSelectedData([0, 1]);
    expect(Array.isArray(selectedData)).toBe(true);
  });
});