/**
 * Tests for configSchema module
 */

import { describe, test, expect } from '@jest/globals';
import {
    CONFIG_DEFAULTS,
    DEFAULT_COLOR_PALETTE,
    COLOR_PRESETS,
    ID_AVERAGE_CATEGORIES,
    deepMerge,
    validateConfig,
    fromLegacyFormat,
    toLegacyFormat,
    mergeWithDefaults,
    resolveColorPalette
} from '../../js/config/configSchema.js';

describe('configSchema', () => {

    describe('CONFIG_DEFAULTS', () => {
        test('should have all required top-level keys', () => {
            expect(CONFIG_DEFAULTS.meta).toBeDefined();
            expect(CONFIG_DEFAULTS.scale).toBeDefined();
            expect(CONFIG_DEFAULTS.categories).toBeDefined();
            expect(CONFIG_DEFAULTS.applications).toBeDefined();
            expect(CONFIG_DEFAULTS.maturityData).toBeDefined();
            expect(CONFIG_DEFAULTS.theme).toBeDefined();
        });

        test('should have sensible default scale', () => {
            expect(CONFIG_DEFAULTS.scale.min).toBe(-1);
            expect(CONFIG_DEFAULTS.scale.max).toBe(4);
            expect(CONFIG_DEFAULTS.scale.levels.length).toBe(6);
        });
    });

    describe('deepMerge', () => {
        test('should merge flat objects', () => {
            const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 });
            expect(result).toEqual({ a: 1, b: 3, c: 4 });
        });

        test('should deep merge nested objects', () => {
            const result = deepMerge(
                { meta: { title: 'old', subtitle: 'keep' } },
                { meta: { title: 'new' } }
            );
            expect(result.meta.title).toBe('new');
            expect(result.meta.subtitle).toBe('keep');
        });

        test('should replace arrays, not merge them', () => {
            const result = deepMerge(
                { categories: ['a', 'b'] },
                { categories: ['x'] }
            );
            expect(result.categories).toEqual(['x']);
        });

        test('should not mutate inputs', () => {
            const target = { a: { b: 1 } };
            const source = { a: { c: 2 } };
            deepMerge(target, source);
            expect(target).toEqual({ a: { b: 1 } });
            expect(source).toEqual({ a: { c: 2 } });
        });

        test('should handle null/undefined source values', () => {
            const result = deepMerge({ a: 1 }, { a: undefined });
            expect(result.a).toBe(1);
        });
    });

    describe('validateConfig', () => {
        const validConfig = {
            categories: ['Cat1', 'Cat2'],
            applications: ['App1'],
            maturityData: [
                [
                    { app: 'App1', axis: 'Cat1', value: 1 },
                    { app: 'App1', axis: 'Cat2', value: 2 }
                ]
            ],
            scale: { min: 0, max: 5, levels: [{ score: 0, label: 'Low' }, { score: 5, label: 'High' }] }
        };

        test('should accept valid config', () => {
            expect(() => validateConfig(validConfig)).not.toThrow();
        });

        test('should reject null config', () => {
            expect(() => validateConfig(null)).toThrow('non-null object');
        });

        test('should reject empty categories', () => {
            expect(() => validateConfig({ ...validConfig, categories: [] }))
                .toThrow('categories must be a non-empty array');
        });

        test('should reject empty applications', () => {
            expect(() => validateConfig({ ...validConfig, applications: [] }))
                .toThrow('applications must be a non-empty array');
        });

        test('should reject maturityData/applications length mismatch', () => {
            expect(() => validateConfig({
                ...validConfig,
                applications: ['App1', 'App2'] // 2 apps but only 1 maturityData entry
            })).toThrow('must match applications length');
        });

        test('should reject maturityData/categories length mismatch', () => {
            expect(() => validateConfig({
                ...validConfig,
                maturityData: [
                    [{ app: 'App1', axis: 'Cat1', value: 1 }] // 1 entry but 2 categories
                ]
            })).toThrow('must match categories length');
        });

        test('should reject invalid data point values', () => {
            expect(() => validateConfig({
                ...validConfig,
                maturityData: [
                    [
                        { app: 'App1', axis: 'Cat1', value: 'bad' },
                        { app: 'App1', axis: 'Cat2', value: 2 }
                    ]
                ]
            })).toThrow('value must be a number');
        });

        test('should reject scale.min >= scale.max', () => {
            expect(() => validateConfig({
                ...validConfig,
                scale: { min: 5, max: 3, levels: [{ score: 3, label: 'A' }, { score: 5, label: 'B' }] }
            })).toThrow('scale.min must be less than scale.max');
        });

        test('should reject unordered scale levels', () => {
            expect(() => validateConfig({
                ...validConfig,
                scale: { min: 0, max: 5, levels: [{ score: 5, label: 'High' }, { score: 0, label: 'Low' }] }
            })).toThrow('ordered by ascending score');
        });
    });

    describe('fromLegacyFormat', () => {
        const legacyData = {
            pageTitle: 'Test Title',
            legendTitle: 'Test Legend',
            averageTitle: 'Test Average',
            referenceLink1: 'https://example.com',
            referenceLinkTitle1: 'Example',
            referenceLink2: 'https://other.com',
            referenceLinkTitle2: 'Other',
            maturityLevels: [
                { score: -1, definition: 'Unranked' },
                { score: 0, definition: 'Base' },
                { score: 3, definition: 'Advanced' }
            ],
            categories: ['Cat1'],
            applications: ['App1'],
            maturityData: [[{ app: 'App1', axis: 'Cat1', value: 1 }]]
        };

        test('should convert meta fields', () => {
            const config = fromLegacyFormat(legacyData);
            expect(config.meta.pageTitle).toBe('Test Title');
            expect(config.meta.legendTitle).toBe('Test Legend');
            expect(config.meta.averageTitle).toBe('Test Average');
        });

        test('should convert references', () => {
            const config = fromLegacyFormat(legacyData);
            expect(config.meta.references).toHaveLength(2);
            expect(config.meta.references[0].url).toBe('https://example.com');
            expect(config.meta.references[1].title).toBe('Other');
        });

        test('should derive scale from maturityLevels', () => {
            const config = fromLegacyFormat(legacyData);
            expect(config.scale.min).toBe(-1);
            expect(config.scale.max).toBe(3);
            expect(config.scale.levels).toHaveLength(3);
            expect(config.scale.levels[0].label).toBe('Unranked');
        });

        test('should pass through categories and applications', () => {
            const config = fromLegacyFormat(legacyData);
            expect(config.categories).toEqual(['Cat1']);
            expect(config.applications).toEqual(['App1']);
        });

        test('should reject null input', () => {
            expect(() => fromLegacyFormat(null)).toThrow();
        });
    });

    describe('toLegacyFormat', () => {
        const newConfig = {
            meta: {
                pageTitle: 'New Title',
                legendTitle: 'New Legend',
                averageTitle: 'New Average',
                references: [
                    { url: 'https://a.com', title: 'Ref A' },
                    { url: 'https://b.com', title: 'Ref B' }
                ]
            },
            scale: {
                min: -2,
                max: 3,
                levels: [
                    { score: -2, label: 'Unranked' },
                    { score: 0, label: 'Base' },
                    { score: 3, label: 'Advanced' }
                ]
            },
            categories: ['Development', 'Testing'],
            applications: ['App1'],
            maturityData: [
                [
                    { app: 'App1', axis: 'Development', value: 1 },
                    { app: 'App1', axis: 'Testing', value: 2 }
                ]
            ]
        };

        test('should convert to legacy shape', () => {
            const legacy = toLegacyFormat(newConfig);
            expect(legacy.pageTitle).toBe('New Title');
            expect(legacy.legendTitle).toBe('New Legend');
            expect(legacy.idAverageCategories).toBe(100);
            expect(legacy.referenceLink1).toBe('https://a.com');
            expect(legacy.referenceLinkTitle2).toBe('Ref B');
            expect(legacy.categoryCount).toBe(2);
        });

        test('should convert maturityLevels', () => {
            const legacy = toLegacyFormat(newConfig);
            expect(legacy.maturityLevels).toHaveLength(3);
            expect(legacy.maturityLevels[0].score).toBe(-2);
            expect(legacy.maturityLevels[0].definition).toBe('Unranked');
        });

        test('should generate emptyDataSet from categories and scale min', () => {
            const legacy = toLegacyFormat(newConfig);
            expect(legacy.emptyDataSet).toHaveLength(1);
            expect(legacy.emptyDataSet[0]).toHaveLength(2);
            expect(legacy.emptyDataSet[0][0].value).toBe(-2);
            expect(legacy.emptyDataSet[0][0].axis).toBe('Development');
        });
    });

    describe('mergeWithDefaults', () => {
        test('should fill missing fields with defaults', () => {
            const partial = { categories: ['A'], applications: ['B'], maturityData: [] };
            const merged = mergeWithDefaults(partial);
            expect(merged.meta.pageTitle).toBe(CONFIG_DEFAULTS.meta.pageTitle);
            expect(merged.scale.min).toBe(-1);
            expect(merged.categories).toEqual(['A']); // Not overridden
        });
    });

    describe('resolveColorPalette', () => {
        test('should return default palette with no overrides', () => {
            const palette = resolveColorPalette({});
            expect(palette).toEqual(DEFAULT_COLOR_PALETTE);
        });

        test('should use config theme palette', () => {
            const custom = ['#111', '#222'];
            const palette = resolveColorPalette({ theme: { colorPalette: custom } });
            expect(palette).toEqual(custom);
        });

        test('should use preset over config palette', () => {
            const palette = resolveColorPalette(
                { theme: { colorPalette: ['#111'] } },
                'colorblind'
            );
            expect(palette).toEqual(COLOR_PRESETS.colorblind.colors);
        });

        test('should ignore unknown preset', () => {
            const palette = resolveColorPalette({}, 'nonexistent');
            expect(palette).toEqual(DEFAULT_COLOR_PALETTE);
        });
    });

    describe('COLOR_PRESETS', () => {
        test('should have at least 3 presets', () => {
            expect(Object.keys(COLOR_PRESETS).length).toBeGreaterThanOrEqual(3);
        });

        test('each preset should have name and colors array', () => {
            for (const [key, preset] of Object.entries(COLOR_PRESETS)) {
                expect(preset.name).toBeTruthy();
                expect(Array.isArray(preset.colors)).toBe(true);
                expect(preset.colors.length).toBeGreaterThanOrEqual(5);
            }
        });
    });

    describe('ID_AVERAGE_CATEGORIES', () => {
        test('should be 100', () => {
            expect(ID_AVERAGE_CATEGORIES).toBe(100);
        });
    });
});
