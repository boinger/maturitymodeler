/**
 * Tests for color scale using production configSchema.js
 */

import { describe, test, expect } from '@jest/globals';

let configSchema;

beforeAll(async () => {
  configSchema = await import('../../js/config/configSchema.js');
});

describe('DEFAULT_COLOR_PALETTE', () => {
  test('should have 20 unique colors', () => {
    const palette = configSchema.DEFAULT_COLOR_PALETTE;
    expect(palette).toHaveLength(20);
    expect(new Set(palette).size).toBe(20);
  });

  test('should contain valid hex color codes', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    configSchema.DEFAULT_COLOR_PALETTE.forEach(color => {
      expect(color).toMatch(hexRegex);
    });
  });
});

describe('COLOR_PRESETS', () => {
  test('should have all expected presets', () => {
    const presets = configSchema.COLOR_PRESETS;
    expect(presets).toHaveProperty('default');
    expect(presets).toHaveProperty('tableau10');
    expect(presets).toHaveProperty('colorblind');
    expect(presets).toHaveProperty('pastel');
    expect(presets).toHaveProperty('vivid');
  });

  test('each preset should have a name and non-empty colors array', () => {
    for (const [key, preset] of Object.entries(configSchema.COLOR_PRESETS)) {
      expect(preset.name).toBeTruthy();
      expect(Array.isArray(preset.colors)).toBe(true);
      expect(preset.colors.length).toBeGreaterThan(0);
    }
  });

  test('each preset should have unique colors within its palette', () => {
    for (const [key, preset] of Object.entries(configSchema.COLOR_PRESETS)) {
      const unique = new Set(preset.colors);
      expect(unique.size).toBe(preset.colors.length);
    }
  });

  test('default preset should match DEFAULT_COLOR_PALETTE', () => {
    expect(configSchema.COLOR_PRESETS.default.colors)
      .toEqual(configSchema.DEFAULT_COLOR_PALETTE);
  });
});

describe('resolveColorPalette', () => {
  test('should return default palette with no arguments', () => {
    const result = configSchema.resolveColorPalette({});
    expect(result).toEqual(configSchema.DEFAULT_COLOR_PALETTE);
  });

  test('should return named preset', () => {
    const result = configSchema.resolveColorPalette({}, 'vivid');
    expect(result).toEqual(configSchema.COLOR_PRESETS.vivid.colors);
  });

  test('should ignore unknown preset names and fall through', () => {
    const result = configSchema.resolveColorPalette({}, 'nonexistent');
    expect(result).toEqual(configSchema.DEFAULT_COLOR_PALETTE);
  });

  test('should use config theme palette when present', () => {
    const custom = ['#aaa', '#bbb', '#ccc'];
    const result = configSchema.resolveColorPalette({ theme: { colorPalette: custom } });
    expect(result).toEqual(custom);
  });

  test('user preset should take priority over config palette', () => {
    const custom = ['#aaa', '#bbb'];
    const result = configSchema.resolveColorPalette(
      { theme: { colorPalette: custom } },
      'tableau10'
    );
    expect(result).toEqual(configSchema.COLOR_PRESETS.tableau10.colors);
  });
});
