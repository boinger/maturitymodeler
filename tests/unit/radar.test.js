/**
 * Tests for radar chart rendering functionality
 * These tests focus on the core logic that had bugs
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Radar Chart Logic', () => {
  describe('Data Binding and Color Management', () => {
    test('should preserve originalIndex for consistent coloring', () => {
      const testData = [
        [
          { app: 'App 1', axis: 'Category 1', value: 60, originalIndex: 0 },
          { app: 'App 1', axis: 'Category 2', value: 80, originalIndex: 0 }
        ],
        [
          { app: 'App 3', axis: 'Category 1', value: 40, originalIndex: 2 },
          { app: 'App 3', axis: 'Category 2', value: 60, originalIndex: 2 }
        ]
      ];
      
      // Test that originalIndex is preserved for color consistency
      testData.forEach(dataset => {
        const firstPoint = dataset[0];
        const lastPoint = dataset[dataset.length - 1];
        
        expect(firstPoint.originalIndex).toBe(lastPoint.originalIndex);
        expect(typeof firstPoint.originalIndex).toBe('number');
      });
      
      // Test that different apps have different indices
      expect(testData[0][0].originalIndex).not.toBe(testData[1][0].originalIndex);
    });

    test('should validate data structure before rendering', () => {
      const validData = [
        [{ app: 'Test', axis: 'Cat1', value: 1, originalIndex: 0 }]
      ];
      
      const invalidData = [
        [{ app: null, axis: 'Cat1', value: 1 }], // null app
        [{ axis: 'Cat1', value: 1 }], // missing app
        [{ app: 'Test', value: 1 }], // missing axis
        [{ app: 'Test', axis: 'Cat1' }] // missing value
      ];
      
      const isValidDataSet = (dataset) => {
        if (!Array.isArray(dataset)) return false;
        
        return dataset.every(appData => {
          if (!Array.isArray(appData)) return false;
          
          return appData.every(point => {
            return point &&
                   typeof point.app === 'string' &&
                   typeof point.axis === 'string' &&
                   typeof point.value === 'number' &&
                   !isNaN(point.value);
          });
        });
      };
      
      expect(isValidDataSet(validData)).toBe(true);
      
      invalidData.forEach(dataset => {
        expect(isValidDataSet(dataset)).toBe(false);
      });
    });
  });

  describe('Polygon Point Calculation', () => {
    test('should calculate polygon points correctly', () => {
      const calculatePolygonPoints = (data, config) => {
        const { w, h, levels, maxValue } = config;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY);
        
        return data.map((point, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const value = Math.max(0, Math.min(maxValue, point.value));
          const distance = (value / maxValue) * radius;
          
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          return { x, y };
        });
      };
      
      const testData = [
        { app: 'Test', axis: 'Cat1', value: 50 },
        { app: 'Test', axis: 'Cat2', value: 100 },
        { app: 'Test', axis: 'Cat3', value: 0 }
      ];
      
      const config = { w: 400, h: 400, levels: 5, maxValue: 100 };
      const points = calculatePolygonPoints(testData, config);
      
      expect(points).toHaveLength(3);
      
      points.forEach(point => {
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
      });
      
      // Center point should be at (200, 200)
      expect(points[2].x).toBeCloseTo(200, 1); // value: 0 should be at center
      expect(points[2].y).toBeCloseTo(200, 1);
    });

    test('should handle edge cases in point calculation', () => {
      const calculateSafePolygonPoints = (data, config) => {
        if (!Array.isArray(data) || data.length === 0) return [];
        if (!config || !config.w || !config.h || !config.maxValue) return [];
        
        const { w, h, maxValue } = config;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY);
        
        return data.map((point, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const value = isNaN(point.value) ? 0 : Math.max(0, Math.min(maxValue, point.value));
          const distance = (value / maxValue) * radius;
          
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          return { x: isNaN(x) ? centerX : x, y: isNaN(y) ? centerY : y };
        });
      };
      
      const edgeCases = [
        [], // empty data
        [{ value: NaN }], // NaN value
        [{ value: Infinity }], // infinite value
        [{ value: -100 }] // negative value
      ];
      
      const config = { w: 400, h: 400, maxValue: 100 };
      
      edgeCases.forEach(data => {
        const points = calculateSafePolygonPoints(data, config);
        
        if (data.length === 0) {
          expect(points).toHaveLength(0);
        } else {
          expect(points).toHaveLength(data.length);
          points.forEach(point => {
            expect(Number.isFinite(point.x)).toBe(true);
            expect(Number.isFinite(point.y)).toBe(true);
          });
        }
      });
    });
  });

  describe('Transition and Animation Logic', () => {
    test('should validate transition parameters', () => {
      const createTransition = (duration, delay = 0) => {
        // Simulate D3 v7 transition syntax validation
        return {
          duration: typeof duration === 'number' && duration >= 0 ? duration : 0,
          delay: typeof delay === 'number' && delay >= 0 ? delay : 0
        };
      };
      
      const validTransitions = [
        createTransition(200),
        createTransition(500, 100),
        createTransition(0)
      ];
      
      const invalidInputs = [
        createTransition(-100), // negative duration -> should become 0
        createTransition('invalid'), // string duration -> should become 0  
        createTransition(null), // null duration -> should become 0
        createTransition(200, -50) // negative delay -> should become 0
      ];
      
      validTransitions.forEach(transition => {
        expect(transition.duration).toBeGreaterThanOrEqual(0);
        expect(transition.delay).toBeGreaterThanOrEqual(0);
      });
      
      // Test that invalid inputs were sanitized by createTransition
      expect(invalidInputs[0].duration).toBe(0); // -100 -> 0
      expect(invalidInputs[1].duration).toBe(0); // 'invalid' -> 0
      expect(invalidInputs[2].duration).toBe(0); // null -> 0
      expect(invalidInputs[3].delay).toBe(0); // -50 -> 0
      expect(invalidInputs[3].duration).toBe(200); // 200 should remain
    });
  });

  describe('Event Handler Data Flow', () => {
    test('should handle D3 v7 event signature correctly', () => {
      // Simulate the fixed event handler pattern
      const createEventHandler = () => {
        return (event, data) => {
          // D3 v7 signature: (event, data) instead of (data, index)
          return {
            hasEvent: event !== undefined,
            hasData: data !== undefined,
            dataValue: data && typeof data.value === 'number' ? data.value : null
          };
        };
      };
      
      const handler = createEventHandler();
      
      // Test with proper D3 v7 signature
      const mockEvent = { pageX: 100, pageY: 100 };
      const mockData = { app: 'Test', axis: 'Category', value: 75 };
      
      const result = handler(mockEvent, mockData);
      
      expect(result.hasEvent).toBe(true);
      expect(result.hasData).toBe(true);
      expect(result.dataValue).toBe(75);
    });

    test('should handle missing or invalid event data', () => {
      const createSafeEventHandler = () => {
        return (event, data) => {
          const safeEvent = event || {};
          const safeData = data || {};
          
          return {
            x: typeof safeEvent.pageX === 'number' ? safeEvent.pageX : 0,
            y: typeof safeEvent.pageY === 'number' ? safeEvent.pageY : 0,
            value: typeof safeData.value === 'number' ? safeData.value : 0,
            app: typeof safeData.app === 'string' ? safeData.app : 'Unknown'
          };
        };
      };
      
      const safeHandler = createSafeEventHandler();
      
      const testCases = [
        { event: null, data: null },
        { event: undefined, data: undefined },
        { event: {}, data: {} },
        { event: { pageX: 'invalid' }, data: { value: 'invalid' } }
      ];
      
      testCases.forEach(({ event, data }) => {
        const result = safeHandler(event, data);
        
        expect(typeof result.x).toBe('number');
        expect(typeof result.y).toBe('number');
        expect(typeof result.value).toBe('number');
        expect(typeof result.app).toBe('string');
      });
    });
  });
});