/**
 * Tests for dynamic scale transformation in DataTransformer
 *
 * Verifies that the instance-level transformValue/reverseTransformValue
 * work correctly across different scale ranges.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import DataTransformer from '../../js/spider/DataTransformer.js';

describe('DataTransformer - Dynamic Scale', () => {

    const makeData = (apps, categories, maturityLevels) => ({
        pageTitle: 'Test',
        legendTitle: 'Test',
        averageTitle: 'Avg',
        idAverageCategories: 100,
        categories,
        applications: apps,
        maturityLevels,
        maturityData: apps.map(app =>
            categories.map(cat => ({ app, axis: cat, value: 0 }))
        ),
        emptyDataSet: [[]]
    });

    describe('CD scale (-1 to 4)', () => {
        let transformer;
        beforeEach(() => {
            transformer = new DataTransformer(null, { min: -1, max: 4 });
            transformer.setDataSource(makeData(
                ['App1'], ['Cat1'],
                [{ score: -1, definition: 'Unranked' }, { score: 4, definition: 'Extreme' }]
            ));
        });

        test('should transform min to 0', () => {
            expect(transformer.transformValue(-1)).toBe(0);
        });

        test('should transform max to 100', () => {
            expect(transformer.transformValue(4)).toBe(100);
        });

        test('should transform midpoint correctly', () => {
            // midpoint of -1 to 4 is 1.5 → (1.5 - (-1))/(4 - (-1)) * 100 = 2.5/5 * 100 = 50
            expect(transformer.transformValue(1.5)).toBe(50);
        });

        test('should reverse transform correctly', () => {
            expect(transformer.reverseTransformValue(0)).toBe(-1);
            expect(transformer.reverseTransformValue(100)).toBe(4);
            expect(transformer.reverseTransformValue(50)).toBe(2); // rounds 1.5 to 2
        });
    });

    describe('IaC scale (-2 to 3)', () => {
        let transformer;
        beforeEach(() => {
            transformer = new DataTransformer(null, { min: -2, max: 3 });
            transformer.setDataSource(makeData(
                ['App1'], ['Cat1'],
                [{ score: -2, definition: 'Unranked' }, { score: 3, definition: 'Optimizing' }]
            ));
        });

        test('should transform min to 0', () => {
            expect(transformer.transformValue(-2)).toBe(0);
        });

        test('should transform max to 100', () => {
            expect(transformer.transformValue(3)).toBe(100);
        });

        test('should match legacy formula 20x+40', () => {
            // For -2 to 3 range, the dynamic formula should produce same results as 20x+40
            expect(transformer.transformValue(-2)).toBe(0);   // 20(-2)+40 = 0
            expect(transformer.transformValue(-1)).toBe(20);  // 20(-1)+40 = 20
            expect(transformer.transformValue(0)).toBe(40);   // 20(0)+40 = 40
            expect(transformer.transformValue(1)).toBe(60);   // 20(1)+40 = 60
            expect(transformer.transformValue(2)).toBe(80);   // 20(2)+40 = 80
            expect(transformer.transformValue(3)).toBe(100);  // 20(3)+40 = 100
        });
    });

    describe('0 to 5 scale', () => {
        let transformer;
        beforeEach(() => {
            transformer = new DataTransformer(null, { min: 0, max: 5 });
            transformer.setDataSource(makeData(['App1'], ['Cat1'], []));
        });

        test('should transform correctly', () => {
            expect(transformer.transformValue(0)).toBe(0);
            expect(transformer.transformValue(1)).toBe(20);
            expect(transformer.transformValue(2.5)).toBe(50);
            expect(transformer.transformValue(5)).toBe(100);
        });

        test('should reverse transform correctly', () => {
            expect(transformer.reverseTransformValue(0)).toBe(0);
            expect(transformer.reverseTransformValue(20)).toBe(1);
            expect(transformer.reverseTransformValue(100)).toBe(5);
        });
    });

    describe('1 to 10 scale', () => {
        let transformer;
        beforeEach(() => {
            transformer = new DataTransformer(null, { min: 1, max: 10 });
            transformer.setDataSource(makeData(['App1'], ['Cat1'], []));
        });

        test('should transform correctly', () => {
            expect(transformer.transformValue(1)).toBe(0);
            expect(transformer.transformValue(10)).toBe(100);
            // midpoint: (5.5 - 1)/(10 - 1)*100 = 4.5/9*100 = 50
            expect(transformer.transformValue(5.5)).toBe(50);
        });
    });

    describe('Auto-detection from maturityLevels', () => {
        test('should derive scale from legacy maturityLevels', () => {
            const data = makeData(['App1'], ['Cat1'], [
                { score: 0, definition: 'None' },
                { score: 1, definition: 'Basic' },
                { score: 2, definition: 'Good' },
                { score: 3, definition: 'Great' }
            ]);

            const transformer = new DataTransformer(data);
            expect(transformer.getScaleMin()).toBe(0);
            expect(transformer.getScaleMax()).toBe(3);
            expect(transformer.transformValue(0)).toBe(0);
            expect(transformer.transformValue(3)).toBe(100);
        });

        test('should use explicit scale over auto-detected', () => {
            const data = makeData(['App1'], ['Cat1'], [
                { score: 0, definition: 'None' },
                { score: 5, definition: 'Max' }
            ]);

            const transformer = new DataTransformer(data, { min: -1, max: 10 });
            expect(transformer.getScaleMin()).toBe(-1);
            expect(transformer.getScaleMax()).toBe(10);
        });
    });

    describe('Scale levels and ring count', () => {
        test('should return correct ring count for 6 levels', () => {
            const transformer = new DataTransformer(null, {
                min: -1, max: 4,
                levels: [
                    { score: -1, label: 'U' },
                    { score: 0, label: 'B' },
                    { score: 1, label: 'M' },
                    { score: 2, label: 'I' },
                    { score: 3, label: 'A' },
                    { score: 4, label: 'E' }
                ]
            });
            transformer.setDataSource(makeData(['App1'], ['Cat1'], []));
            expect(transformer.getRingCount()).toBe(5);
        });

        test('should return correct ring count for 3 levels', () => {
            const transformer = new DataTransformer(null, {
                min: 0, max: 2,
                levels: [
                    { score: 0, label: 'Low' },
                    { score: 1, label: 'Mid' },
                    { score: 2, label: 'High' }
                ]
            });
            transformer.setDataSource(makeData(['App1'], ['Cat1'], []));
            expect(transformer.getRingCount()).toBe(2);
        });
    });

    describe('setScale method', () => {
        test('should reject invalid scale', () => {
            const transformer = new DataTransformer();
            expect(() => transformer.setScale(null)).toThrow();
            expect(() => transformer.setScale({ min: 'a', max: 3 })).toThrow();
            expect(() => transformer.setScale({ min: 5, max: 3 })).toThrow('min must be less than');
        });

        test('should re-transform data when scale changes', () => {
            const data = makeData(['App1'], ['Cat1'], []);
            // Override maturityData with a known value
            data.maturityData = [[{ app: 'App1', axis: 'Cat1', value: 5 }]];

            const transformer = new DataTransformer(data, { min: 0, max: 10 });
            expect(transformer.getTransformedData()[0][0].value).toBe(50); // 5/10 * 100

            transformer.setScale({ min: 0, max: 5 });
            expect(transformer.getTransformedData()[0][0].value).toBe(100); // 5/5 * 100
        });
    });

    describe('Invalid value handling', () => {
        test('should handle non-number input to transformValue', () => {
            const transformer = new DataTransformer(null, { min: 0, max: 10 });
            transformer.setDataSource(makeData(['App1'], ['Cat1'], []));
            // Should warn and return transform of 0
            const result = transformer.transformValue('bad');
            expect(result).toBe(0); // (0 - 0) / (10 - 0) * 100 = 0
        });

        test('should handle non-number input to reverseTransformValue', () => {
            const transformer = new DataTransformer(null, { min: 0, max: 10 });
            transformer.setDataSource(makeData(['App1'], ['Cat1'], []));
            const result = transformer.reverseTransformValue('bad');
            expect(result).toBe(0); // min value
        });
    });
});
