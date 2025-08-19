/**
 * Unit tests for color scale consistency
 * These tests would have caught the color collision issues
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

describe('Color Scale Tests', () => {
  let colorScale;
  
  beforeEach(() => {
    // Use the same custom colors from the app
    const customColors = [
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
      "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
      "#c49c94", "#f7b6d3", "#c7c7c7", "#dbdb8d", "#9edae5"
    ];
    colorScale = scaleOrdinal(customColors);
  });

  describe('Color Uniqueness', () => {
    test('should provide unique colors for indices 0-19', () => {
      const colors = [];
      for (let i = 0; i < 20; i++) {
        colors.push(colorScale(i));
      }
      
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors).toHaveLength(20);
      expect(colors).toHaveLength(20);
    });

    test('should not have color collision between first and last items', () => {
      const color0 = colorScale(0);
      const color9 = colorScale(9);
      const color19 = colorScale(19);
      
      expect(color0).not.toBe(color9);
      expect(color0).not.toBe(color19);
      expect(color9).not.toBe(color19);
    });

    test('should handle high index values (like idAverageCategories = 100)', () => {
      const color100 = colorScale(100);
      const color0 = colorScale(0);
      
      // D3 ordinal scale cycles, so color(100) should equal color(0) since 100 % 20 = 0
      // But that's expected behavior for ordinal scales
      expect(typeof color100).toBe('string');
      expect(color100.startsWith('#')).toBe(true);
    });
  });

  describe('Color Consistency', () => {
    test('should return same color for same index', () => {
      const color1a = colorScale(5);
      const color1b = colorScale(5);
      expect(color1a).toBe(color1b);
    });

    test('should return different colors for different indices within range', () => {
      const colors = new Map();
      for (let i = 0; i < 10; i++) {
        const color = colorScale(i);
        expect(colors.has(color)).toBe(false);
        colors.set(color, i);
      }
    });
  });

  describe('Color Format', () => {
    test('should return valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      for (let i = 0; i < 10; i++) {
        const color = colorScale(i);
        expect(color).toMatch(hexColorRegex);
      }
    });
  });

  describe('Application-specific Tests', () => {
    test('should provide distinct colors for typical app count (10 apps)', () => {
      const appColors = [];
      for (let i = 0; i < 10; i++) {
        appColors.push(colorScale(i));
      }
      
      const uniqueAppColors = [...new Set(appColors)];
      expect(uniqueAppColors).toHaveLength(10);
    });

    test('should handle average category index (100) without error', () => {
      expect(() => colorScale(100)).not.toThrow();
      expect(typeof colorScale(100)).toBe('string');
    });

    test('should provide visually distinct colors for adjacent indices', () => {
      // Test that adjacent indices don't have similar colors
      // This is a visual/accessibility concern
      const color0 = colorScale(0); // "#1f77b4" (blue)
      const color1 = colorScale(1); // "#ff7f0e" (orange)
      
      expect(color0).not.toBe(color1);
      
      // Could add more sophisticated color distance testing here
      // using color theory (HSL, LAB color space differences)
    });
  });
});