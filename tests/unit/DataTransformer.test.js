/**
 * Tests for DataTransformer class
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import DataTransformer from '../../js/radar/DataTransformer.js';

describe('DataTransformer', () => {
    let transformer;
    let mockData;

    beforeEach(() => {
        mockData = {
            pageTitle: 'Test Maturity Model',
            legendTitle: 'Test Legend',
            averageTitle: 'Test Averages',
            idAverageCategories: 100,
            categories: ['Category 1', 'Category 2', 'Category 3'],
            applications: ['App B', 'App A', 'App C'], // Intentionally unsorted
            maturityData: [
                [
                    { app: 'App B', axis: 'Category 1', value: -1 },
                    { app: 'App B', axis: 'Category 2', value: 0 },
                    { app: 'App B', axis: 'Category 3', value: 1 }
                ],
                [
                    { app: 'App A', axis: 'Category 1', value: 2 },
                    { app: 'App A', axis: 'Category 2', value: -2 },
                    { app: 'App A', axis: 'Category 3', value: 3 }
                ],
                [
                    { app: 'App C', axis: 'Category 1', value: 0 },
                    { app: 'App C', axis: 'Category 2', value: 1 },
                    { app: 'App C', axis: 'Category 3', value: -1 }
                ]
            ],
            emptyDataSet: [[]]
        };

        transformer = new DataTransformer();
    });

    describe('Constructor', () => {
        test('should initialize without data', () => {
            expect(transformer.currentData).toBeNull();
            expect(transformer.transformedData).toBeNull();
            expect(transformer.cache).toBeDefined();
        });

        test('should initialize with data', () => {
            const transformerWithData = new DataTransformer(mockData);
            expect(transformerWithData.currentData).toBeDefined();
            expect(transformerWithData.transformedData).toBeDefined();
        });
    });

    describe('Data Source Management', () => {
        test('should set data source successfully', () => {
            transformer.setDataSource(mockData);
            
            expect(transformer.currentData).toBeDefined();
            expect(transformer.transformedData).toBeDefined();
            expect(transformer.currentData.pageTitle).toBe('Test Maturity Model');
        });

        test('should throw error for null data source', () => {
            expect(() => transformer.setDataSource(null)).toThrow('Data source cannot be null');
        });

        test('should validate required fields', () => {
            const invalidData = { pageTitle: 'Test' };
            
            expect(() => transformer.setDataSource(invalidData)).toThrow('Missing required field');
        });

        test('should validate maturityData structure', () => {
            const invalidData = {
                ...mockData,
                maturityData: []
            };
            
            expect(() => transformer.setDataSource(invalidData)).toThrow('maturityData must be a non-empty array');
        });
    });

    describe('Scale Transformation', () => {
        test('should transform scale correctly', () => {
            // Formula: 20x + 40
            expect(DataTransformer.transformScale(-2)).toBe(0);   // 20(-2) + 40 = 0
            expect(DataTransformer.transformScale(-1)).toBe(20);  // 20(-1) + 40 = 20
            expect(DataTransformer.transformScale(0)).toBe(40);   // 20(0) + 40 = 40
            expect(DataTransformer.transformScale(1)).toBe(60);   // 20(1) + 40 = 60
            expect(DataTransformer.transformScale(2)).toBe(80);   // 20(2) + 40 = 80
            expect(DataTransformer.transformScale(3)).toBe(100);  // 20(3) + 40 = 100
        });

        test('should reverse transform scale correctly', () => {
            // Formula: (x - 40) / 20
            expect(DataTransformer.transformScaleReverse(0)).toBe(-2);
            expect(DataTransformer.transformScaleReverse(20)).toBe(-1);
            expect(DataTransformer.transformScaleReverse(40)).toBe(0);
            expect(DataTransformer.transformScaleReverse(60)).toBe(1);
            expect(DataTransformer.transformScaleReverse(80)).toBe(2);
            expect(DataTransformer.transformScaleReverse(100)).toBe(3);
        });

        test('should handle invalid scale values', () => {
            // Should use fallback values and warn
            expect(DataTransformer.transformScale(null)).toBe(40);
            expect(DataTransformer.transformScale('invalid')).toBe(40);
            expect(DataTransformer.transformScaleReverse(null)).toBe(0);
            expect(DataTransformer.transformScaleReverse('invalid')).toBe(0);
        });
    });

    describe('Data Retrieval', () => {
        beforeEach(() => {
            transformer.setDataSource(mockData);
        });

        test('should get app names sorted', () => {
            const appNames = transformer.getAppNames();
            
            expect(appNames).toEqual(['App A', 'App B', 'App C']);
            expect(appNames).toHaveLength(3);
        });

        test('should get legend names', () => {
            const legendNames = transformer.getLegendNames();
            
            expect(legendNames).toEqual(['Category 1', 'Category 2', 'Category 3']);
            expect(legendNames).toHaveLength(3);
        });

        test('should get transformed sorted data', () => {
            const sortedData = transformer.getTransformedSortedData();
            
            expect(sortedData).toHaveLength(3);
            expect(sortedData[0][0].app).toBe('App A'); // First should be App A (sorted)
            expect(sortedData[0][0].value).toBe(80); // Transformed value: 20(2) + 40 = 80
        });

        test('should get selected data by indices', () => {
            const selectedData = transformer.getSelectedData([0, 2]); // App A and App C
            
            expect(selectedData).toHaveLength(2);
            expect(selectedData[0][0].app).toBe('App A');
            expect(selectedData[1][0].app).toBe('App C');
        });

        test('should handle invalid selected indices', () => {
            const selectedData = transformer.getSelectedData([0, 999, -1]);
            
            expect(selectedData).toHaveLength(1); // Only valid index 0
            expect(selectedData[0][0].app).toBe('App A');
        });

        test('should get single dataset by name', () => {
            const appData = transformer.getSingleDataSet('App B');
            
            expect(appData).toBeDefined();
            expect(appData[0].app).toBe('App B');
            expect(appData[0].value).toBe(20); // Transformed: 20(-1) + 40 = 20
        });

        test('should return undefined for non-existent app', () => {
            const appData = transformer.getSingleDataSet('Non-existent App');
            
            expect(appData).toBeUndefined();
        });
    });

    describe('Category Averages', () => {
        beforeEach(() => {
            transformer.setDataSource(mockData);
        });

        test('should calculate category averages correctly', () => {
            const averages = transformer.getCategoryAvgs();
            
            expect(averages).toHaveLength(1);
            expect(averages[0]).toHaveLength(3);
            
            // Category 1: App A=80, App B=20, App C=40 → avg = 47 (rounded)
            // Category 2: App A=0, App B=40, App C=60 → avg = 33 (rounded)
            // Category 3: App A=100, App B=60, App C=20 → avg = 60
            expect(averages[0][0].value).toBe(47);
            expect(averages[0][1].value).toBe(33);
            expect(averages[0][2].value).toBe(60);
            
            expect(averages[0][0].app).toBe('Test Averages');
            expect(averages[0][0].originalIndex).toBe(100);
        });
    });

    describe('Maturity Ratings', () => {
        beforeEach(() => {
            transformer.setDataSource(mockData);
        });

        test('should get all apps maturity ratings', () => {
            const ratings = transformer.getAllAppsMaturityRating();
            
            expect(ratings).toHaveLength(3);
            
            // Should be sorted by average rating (descending)
            expect(ratings[0].app).toBe('App A'); // Highest average
            expect(ratings[0].averageRating).toBe(60); // (80+0+100)/3 = 60
            expect(ratings[0].rawAverage).toBe(1); // Reverse transform of 60
            expect(ratings[0].dataPoints).toBe(3);
            
            // Verify sorting
            expect(ratings[0].averageRating).toBeGreaterThanOrEqual(ratings[1].averageRating);
            expect(ratings[1].averageRating).toBeGreaterThanOrEqual(ratings[2].averageRating);
        });
    });

    describe('Caching', () => {
        beforeEach(() => {
            transformer.setDataSource(mockData);
        });

        test('should cache results', () => {
            // First call
            const firstCall = transformer.getAppNames();
            const cacheStats = transformer.getCacheStats();
            
            expect(cacheStats.size).toBe(1);
            expect(cacheStats.keys).toContain('appNames');
            
            // Second call should use cache
            const secondCall = transformer.getAppNames();
            expect(firstCall).toBe(secondCall); // Same reference
        });

        test('should clear cache when data source changes', () => {
            transformer.getAppNames(); // Populate cache
            
            const newData = { ...mockData, applications: ['New App'] };
            transformer.setDataSource(newData);
            
            const cacheStats = transformer.getCacheStats();
            expect(cacheStats.size).toBe(0); // Cache cleared
        });
    });

    describe('Error Handling', () => {
        test('should throw error when no data source set', () => {
            expect(() => transformer.getAppNames()).toThrow('No data source set');
            expect(() => transformer.getTransformedSortedData()).toThrow('No transformed data available');
        });

        test('should handle invalid input gracefully', () => {
            transformer.setDataSource(mockData);
            
            expect(transformer.getSelectedData(null)).toEqual([]);
            expect(transformer.getSelectedData('invalid')).toEqual([]);
            expect(transformer.getSingleDataSet(null)).toBeUndefined();
            expect(transformer.getSingleDataSet('')).toBeUndefined();
        });
    });

    describe('Utility Methods', () => {
        beforeEach(() => {
            transformer.setDataSource(mockData);
        });

        test('should get current data', () => {
            const currentData = transformer.getCurrentData();
            
            expect(currentData).toBeDefined();
            expect(currentData.pageTitle).toBe('Test Maturity Model');
        });

        test('should get transformed data', () => {
            const transformedData = transformer.getTransformedData();
            
            expect(transformedData).toBeDefined();
            expect(transformedData[0][0].value).toBe(20); // Transformed from -1
        });

        test('should reset transformer', () => {
            transformer.reset();
            
            expect(transformer.getCurrentData()).toBeNull();
            expect(transformer.getTransformedData()).toBeNull();
            expect(transformer.getCacheStats().size).toBe(0);
        });
    });

    describe('originalIndex Preservation', () => {
        test('should preserve originalIndex from data', () => {
            const dataWithIndex = {
                ...mockData,
                maturityData: [
                    [
                        { app: 'App A', axis: 'Cat1', value: 1, originalIndex: 5 }
                    ]
                ]
            };
            
            transformer.setDataSource(dataWithIndex);
            const transformedData = transformer.getTransformedData();
            
            expect(transformedData[0][0].originalIndex).toBe(5);
        });

        test('should assign originalIndex if missing', () => {
            transformer.setDataSource(mockData);
            const transformedData = transformer.getTransformedData();
            
            expect(transformedData[0][0].originalIndex).toBe(0); // App index
            expect(transformedData[1][0].originalIndex).toBe(1);
            expect(transformedData[2][0].originalIndex).toBe(2);
        });
    });
});