/**
 * Tests for data validation using production configSchema.js
 */

import { describe, test, expect } from '@jest/globals';

let configSchema;

beforeAll(async () => {
  configSchema = await import('../../js/config/configSchema.js');
});

describe('validateConfig', () => {
  const minimalValid = {
    categories: ['Cat1', 'Cat2'],
    applications: ['App1'],
    maturityData: [
      [
        { app: 'App1', axis: 'Cat1', value: 1 },
        { app: 'App1', axis: 'Cat2', value: 2 }
      ]
    ]
  };

  test('should accept a valid config', () => {
    expect(() => configSchema.validateConfig(minimalValid)).not.toThrow();
  });

  test('should reject null or non-object config', () => {
    expect(() => configSchema.validateConfig(null)).toThrow(/non-null object/);
    expect(() => configSchema.validateConfig(undefined)).toThrow(/non-null object/);
    expect(() => configSchema.validateConfig('string')).toThrow(/non-null object/);
  });

  test('should reject empty categories', () => {
    expect(() => configSchema.validateConfig({ ...minimalValid, categories: [] }))
      .toThrow(/categories/);
  });

  test('should reject non-string category entries', () => {
    expect(() => configSchema.validateConfig({ ...minimalValid, categories: [123, 'Cat2'] }))
      .toThrow(/categories\[0\]/);
  });

  test('should reject empty applications', () => {
    expect(() => configSchema.validateConfig({ ...minimalValid, applications: [] }))
      .toThrow(/applications/);
  });

  test('should reject mismatched maturityData dimensions', () => {
    const bad = {
      categories: ['Cat1'],
      applications: ['App1', 'App2'],
      maturityData: [
        [{ app: 'App1', axis: 'Cat1', value: 1 }]
        // missing second app
      ]
    };
    expect(() => configSchema.validateConfig(bad)).toThrow(/maturityData length/);
  });

  test('should reject non-numeric maturityData values', () => {
    const bad = {
      categories: ['Cat1'],
      applications: ['App1'],
      maturityData: [
        [{ app: 'App1', axis: 'Cat1', value: 'bad' }]
      ]
    };
    expect(() => configSchema.validateConfig(bad)).toThrow(/value must be a number/);
  });

  test('should validate scale ordering', () => {
    const bad = {
      ...minimalValid,
      scale: {
        min: 5,
        max: 1,
        levels: [
          { score: 1, label: 'Low' },
          { score: 5, label: 'High' }
        ]
      }
    };
    expect(() => configSchema.validateConfig(bad)).toThrow(/scale.min must be less/);
  });

  test('should reject scale levels out of ascending order', () => {
    const bad = {
      ...minimalValid,
      scale: {
        min: 0,
        max: 5,
        levels: [
          { score: 3, label: 'High' },
          { score: 1, label: 'Low' }
        ]
      }
    };
    expect(() => configSchema.validateConfig(bad)).toThrow(/ascending score/);
  });
});

describe('fromLegacyFormat', () => {
  test('should reject null input', () => {
    expect(() => configSchema.fromLegacyFormat(null)).toThrow();
  });

  test('should convert legacy data to new schema', () => {
    const legacy = {
      pageTitle: 'Test Title',
      legendTitle: 'Legend',
      averageTitle: 'Avg',
      referenceLink1: 'http://example.com',
      referenceLinkTitle1: 'Example',
      categories: ['Cat1'],
      applications: ['App1'],
      maturityData: [],
      maturityLevels: [
        { score: 0, definition: 'Base' },
        { score: 3, definition: 'Advanced' }
      ]
    };

    const result = configSchema.fromLegacyFormat(legacy);

    expect(result.meta.pageTitle).toBe('Test Title');
    expect(result.meta.references).toHaveLength(1);
    expect(result.meta.references[0].url).toBe('http://example.com');
    expect(result.scale.min).toBe(0);
    expect(result.scale.max).toBe(3);
    expect(result.scale.levels).toHaveLength(2);
  });
});

describe('deepMerge', () => {
  test('should merge nested objects', () => {
    const target = { a: { b: 1, c: 2 } };
    const source = { a: { c: 3, d: 4 } };
    const result = configSchema.deepMerge(target, source);

    expect(result.a.b).toBe(1);
    expect(result.a.c).toBe(3);
    expect(result.a.d).toBe(4);
  });

  test('should not mutate inputs', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    configSchema.deepMerge(target, source);

    expect(target).toEqual({ a: 1 });
    expect(source).toEqual({ b: 2 });
  });

  test('should replace arrays, not merge them', () => {
    const target = { arr: [1, 2, 3] };
    const source = { arr: [4, 5] };
    const result = configSchema.deepMerge(target, source);

    expect(result.arr).toEqual([4, 5]);
  });
});

describe('resolveColorPalette', () => {
  test('should return default palette when no overrides', () => {
    const palette = configSchema.resolveColorPalette({});
    expect(palette).toEqual(configSchema.DEFAULT_COLOR_PALETTE);
  });

  test('should return preset palette by name', () => {
    const palette = configSchema.resolveColorPalette({}, 'colorblind');
    expect(palette).toEqual(configSchema.COLOR_PRESETS.colorblind.colors);
  });

  test('should prefer user override over config palette', () => {
    const config = { theme: { colorPalette: ['#000', '#fff'] } };
    const palette = configSchema.resolveColorPalette(config, 'tableau10');
    expect(palette).toEqual(configSchema.COLOR_PRESETS.tableau10.colors);
  });

  test('should use config theme palette when no user override', () => {
    const config = { theme: { colorPalette: ['#000', '#fff'] } };
    const palette = configSchema.resolveColorPalette(config);
    expect(palette).toEqual(['#000', '#fff']);
  });
});
