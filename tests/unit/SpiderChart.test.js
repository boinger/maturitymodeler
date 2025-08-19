/**
 * Simple tests for SpiderChart class functionality
 */

import { describe, test, expect } from '@jest/globals';
import SpiderChart, { createSpiderChart } from '../../js/radar/SpiderChart.js';

describe('SpiderChart', () => {
    describe('Constructor and Configuration', () => {
        test('should initialize with default config', () => {
            const chart = new SpiderChart('#test-container');
            
            expect(chart.containerId).toBe('#test-container');
            expect(chart.config.w).toBe(800);
            expect(chart.config.h).toBe(800);
            expect(chart.config.levels).toBe(3);
            expect(chart.config.maxValue).toBe(100);
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
        
        test('should calculate coordinates correctly', () => {
            const [x, y] = chart.calculateCoordinates(50, 0, 4);
            
            // At index 0 (top), with value 50 (half of max 100)
            expect(x).toBeCloseTo(400); // Center X
            expect(y).toBeCloseTo(200); // Half way up from center
        });
        
        test('should handle zero values', () => {
            const [x, y] = chart.calculateCoordinates(0, 0, 4);
            
            expect(x).toBe(400); // Center X
            expect(y).toBe(400); // Center Y
        });
        
        test('should handle negative values as zero', () => {
            const [x1, y1] = chart.calculateCoordinates(-10, 0, 4);
            const [x2, y2] = chart.calculateCoordinates(0, 0, 4);
            
            expect(x1).toBe(x2);
            expect(y1).toBe(y2);
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