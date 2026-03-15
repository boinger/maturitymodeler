/**
 * Simple tests for SpiderChart class functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import SpiderChart, { createSpiderChart } from '../../js/spider/SpiderChart.js';

describe('SpiderChart', () => {
    describe('Constructor and Configuration', () => {
        test('should initialize with default config', () => {
            const chart = new SpiderChart('#test-container');
            
            expect(chart.containerId).toBe('#test-container');
            expect(chart.config.w).toBe(800);
            expect(chart.config.h).toBe(800);
            expect(chart.config.levels).toBe(5);
            expect(chart.config.maxValue).toBe(4);
            expect(chart.config.minValue).toBe(-1);
        });
        
        test('should accept custom config', () => {
            const chart = new SpiderChart('#custom', {
                w: 600,
                h: 600,
                levels: 5,
                maxValue: 10
            });
            
            expect(chart.config.w).toBe(600);
            expect(chart.config.h).toBe(600);
            expect(chart.config.levels).toBe(5);
            expect(chart.config.maxValue).toBe(10);
        });
        
        test('should calculate center coordinates', () => {
            const chart = new SpiderChart('#test');
            expect(chart.centerX).toBe(400);
            expect(chart.centerY).toBe(400);
        });
    });
    
    describe('Data Validation', () => {
        let chart;
        
        beforeEach(() => {
            chart = new SpiderChart('#test');
        });
        
        test('should validate correct data structure', () => {
            const validData = [
                [
                    { app: 'App1', axis: 'Cat1', value: 50 },
                    { app: 'App1', axis: 'Cat2', value: 75 }
                ]
            ];
            
            expect(chart.validateData(validData)).toBe(true);
        });
        
        test('should reject empty data', () => {
            expect(chart.validateData([])).toBe(false);
            expect(chart.validateData(null)).toBe(false);
            expect(chart.validateData(undefined)).toBe(false);
        });
        
        test('should reject invalid data structure', () => {
            const invalidData = [
                { not: 'an array' }
            ];
            
            expect(chart.validateData(invalidData)).toBe(false);
        });
    });
    
    describe('Coordinate Calculations', () => {
        let chart;

        beforeEach(() => {
            chart = new SpiderChart('#test');
        });

        test('should place maxValue at the edge', () => {
            // Default maxValue is 4, minValue is -1
            // At index 0 (top), maxValue should be at the top edge: x=center, y=0
            const [x, y] = chart.calculateCoordinates(4, 0, 4);
            expect(x).toBeCloseTo(400);
            expect(y).toBeCloseTo(0);
        });

        test('should place minValue at the center', () => {
            // minValue (-1) normalizes to 0, so coordinates should be at center
            const [x, y] = chart.calculateCoordinates(-1, 0, 4);
            expect(x).toBeCloseTo(400);
            expect(y).toBeCloseTo(400);
        });

        test('should clamp values below minValue to center', () => {
            const [x1, y1] = chart.calculateCoordinates(-10, 0, 4);
            const [x2, y2] = chart.calculateCoordinates(-1, 0, 4);

            // Both should map to center since -10 clamps to 0 normalized
            expect(x1).toBeCloseTo(x2);
            expect(y1).toBeCloseTo(y2);
        });

        test('should return different coords for different axis indices', () => {
            const [x0, y0] = chart.calculateCoordinates(2, 0, 4);
            const [x1, y1] = chart.calculateCoordinates(2, 1, 4);

            // Same value on different axes should give different positions
            expect(x0).not.toBeCloseTo(x1);
        });
    });
    
    describe('Polygon Path Generation', () => {
        let chart;
        
        beforeEach(() => {
            chart = new SpiderChart('#test');
        });
        
        test('should generate correct polygon path', () => {
            const series = [
                { app: 'App1', axis: 'Cat1', value: 50 },
                { app: 'App1', axis: 'Cat2', value: 75 },
                { app: 'App1', axis: 'Cat3', value: 25 },
                { app: 'App1', axis: 'Cat4', value: 100 }
            ];
            
            const path = chart.generatePolygonPath(series);
            
            // Should be a space-separated list of comma-separated coordinates
            expect(typeof path).toBe('string');
            expect(path.split(' ').length).toBe(5); // 4 points + closing point
            
            // Each point should be x,y format
            const points = path.split(' ');
            points.forEach(point => {
                expect(point).toMatch(/^\d+(\.\d+)?,\d+(\.\d+)?$/);
            });
        });
        
        test('should close the polygon', () => {
            const series = [
                { app: 'App1', axis: 'Cat1', value: 50 },
                { app: 'App1', axis: 'Cat2', value: 75 }
            ];
            
            const path = chart.generatePolygonPath(series);
            const points = path.split(' ');
            
            // Last point should equal first point
            expect(points[0]).toBe(points[points.length - 1]);
        });
    });
    
    describe('Configuration Updates', () => {
        test('should update config and recalculate centers', () => {
            const chart = new SpiderChart('#test');
            chart.updateConfig({ w: 600, h: 600 });
            
            expect(chart.config.w).toBe(600);
            expect(chart.config.h).toBe(600);
            expect(chart.centerX).toBe(300);
            expect(chart.centerY).toBe(300);
        });
        
        test('should support method chaining', () => {
            const chart = new SpiderChart('#test');
            const result = chart.updateConfig({ levels: 5 });
            
            expect(result).toBe(chart);
        });
    });
    
    describe('Factory Function', () => {
        test('should exist and be callable', () => {
            expect(typeof createSpiderChart).toBe('function');
        });
    });
    
    describe('Color Scale', () => {
        test('should initialize color scale', () => {
            const chart = new SpiderChart('#test');
            expect(chart.colorScale).toBeDefined();
            expect(typeof chart.colorScale).toBe('function');
        });
        
        test('should return different colors for different indices', () => {
            const chart = new SpiderChart('#test');
            const color1 = chart.colorScale(0);
            const color2 = chart.colorScale(1);
            
            expect(color1).not.toBe(color2);
        });
    });
    
    describe('Edge Cases', () => {
        let chart;
        
        beforeEach(() => {
            chart = new SpiderChart('#test');
        });
        
        test('should handle single data point', () => {
            const data = [
                [
                    { app: 'App1', axis: 'Cat1', value: 50 }
                ]
            ];
            
            expect(chart.validateData(data)).toBe(true);
        });
        
        test('should handle all zero values', () => {
            const data = [
                [
                    { app: 'App1', axis: 'Cat1', value: 0 },
                    { app: 'App1', axis: 'Cat2', value: 0 },
                    { app: 'App1', axis: 'Cat3', value: 0 }
                ]
            ];
            
            expect(chart.validateData(data)).toBe(true);
        });
        
        test('should handle special characters in labels', () => {
            const data = [
                [
                    { app: 'App & Co.', axis: 'Cat<1>', value: 50 },
                    { app: 'App & Co.', axis: 'Cat"2"', value: 75 }
                ]
            ];
            
            expect(chart.validateData(data)).toBe(true);
        });
    });
});