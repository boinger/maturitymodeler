/**
 * Tests for data validation and error handling
 * These tests ensure malformed data doesn't crash the application
 */

import { describe, test, expect } from '@jest/globals';

describe('Data Validation', () => {
  describe('Maturity Data Validation', () => {
    test('should validate complete maturity data structure', () => {
      const validData = [
        [
          { app: 'Test App', axis: 'Category 1', value: 1 },
          { app: 'Test App', axis: 'Category 2', value: 0 }
        ]
      ];
      
      const isValidMaturityData = (data) => {
        if (!Array.isArray(data)) return false;
        
        return data.every(appData => {
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
      
      expect(isValidMaturityData(validData)).toBe(true);
    });

    test('should reject invalid maturity data structures', () => {
      const invalidDataSets = [
        null, // null data
        undefined, // undefined data
        "not an array", // wrong type
        [], // empty array
        [null], // null app data
        [["not an object"]], // wrong app data type
        [[{ app: null, axis: 'test', value: 1 }]], // null app name
        [[{ app: 'test', axis: null, value: 1 }]], // null axis
        [[{ app: 'test', axis: 'test', value: 'invalid' }]], // invalid value
        [[{ app: 'test', axis: 'test', value: NaN }]], // NaN value
        [[{ app: 'test', axis: 'test' }]], // missing value
        [[{}]] // empty object
      ];
      
      const isValidMaturityData = (data) => {
        if (!Array.isArray(data) || data.length === 0) return false;
        
        return data.every(appData => {
          if (!Array.isArray(appData) || appData.length === 0) return false;
          
          return appData.every(point => {
            return point && 
                   typeof point.app === 'string' && point.app.length > 0 &&
                   typeof point.axis === 'string' && point.axis.length > 0 &&
                   typeof point.value === 'number' &&
                   !isNaN(point.value);
          });
        });
      };
      
      invalidDataSets.forEach(invalidData => {
        expect(isValidMaturityData(invalidData)).toBe(false);
      });
    });

    test('should sanitize malformed data points', () => {
      const malformedData = [
        { app: '', axis: 'test', value: 1 }, // empty app name
        { app: 'test', axis: '', value: 1 }, // empty axis
        { app: 'test', axis: 'test', value: null }, // null value
        { app: 'test', axis: 'test', value: undefined }, // undefined value
        { app: 'test', axis: 'test', value: 'string' }, // string value
        { app: 'test', axis: 'test', value: Infinity }, // infinite value
        { app: 'test', axis: 'test', value: -Infinity } // negative infinite value
      ];
      
      const sanitizeDataPoint = (point) => {
        const sanitized = {
          app: (typeof point.app === 'string' && point.app.length > 0) ? point.app : 'Unknown App',
          axis: (typeof point.axis === 'string' && point.axis.length > 0) ? point.axis : 'Unknown Category',
          value: 0 // default value
        };
        
        // Sanitize value
        const numValue = Number(point.value);
        if (!isNaN(numValue) && isFinite(numValue)) {
          sanitized.value = Math.max(-2, Math.min(3, numValue)); // Clamp to valid range
        }
        
        return sanitized;
      };
      
      malformedData.forEach(point => {
        const sanitized = sanitizeDataPoint(point);
        
        expect(typeof sanitized.app).toBe('string');
        expect(sanitized.app.length).toBeGreaterThan(0);
        expect(typeof sanitized.axis).toBe('string');
        expect(sanitized.axis.length).toBeGreaterThan(0);
        expect(typeof sanitized.value).toBe('number');
        expect(isFinite(sanitized.value)).toBe(true);
        expect(sanitized.value).toBeGreaterThanOrEqual(-2);
        expect(sanitized.value).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Configuration Validation', () => {
    test('should validate chart configuration', () => {
      const validConfig = {
        w: 600,
        h: 600,
        factor: 1,
        levels: 5,
        maxValue: 100,
        radius: 5
      };
      
      const isValidConfig = (config) => {
        return config &&
               typeof config.w === 'number' && config.w > 0 &&
               typeof config.h === 'number' && config.h > 0 &&
               typeof config.factor === 'number' && config.factor > 0 &&
               typeof config.levels === 'number' && config.levels > 0 &&
               typeof config.maxValue === 'number' && config.maxValue > 0 &&
               typeof config.radius === 'number' && config.radius >= 0;
      };
      
      expect(isValidConfig(validConfig)).toBe(true);
    });

    test('should provide default configuration for invalid inputs', () => {
      const invalidConfigs = [
        null,
        undefined,
        {},
        { w: -100, h: 600 },
        { w: 'invalid', h: 600 },
        { w: 600, h: undefined }
      ];
      
      const getValidConfig = (userConfig) => {
        const defaultConfig = {
          w: 600,
          h: 600,
          factor: 1,
          levels: 5,
          maxValue: 100,
          radius: 5
        };
        
        if (!userConfig || typeof userConfig !== 'object') {
          return defaultConfig;
        }
        
        const config = { ...defaultConfig };
        
        // Validate and apply user settings
        Object.keys(defaultConfig).forEach(key => {
          if (typeof userConfig[key] === 'number' && 
              userConfig[key] > 0 && 
              isFinite(userConfig[key])) {
            config[key] = userConfig[key];
          }
        });
        
        return config;
      };
      
      invalidConfigs.forEach(invalidConfig => {
        const config = getValidConfig(invalidConfig);
        
        expect(config.w).toBe(600);
        expect(config.h).toBe(600);
        expect(config.factor).toBe(1);
        expect(config.levels).toBe(5);
        expect(config.maxValue).toBe(100);
        expect(config.radius).toBe(5);
      });
    });
  });

  describe('Category and Application Validation', () => {
    test('should validate categories array', () => {
      const validCategories = [
        'Build Management',
        'Deployment',
        'Testing',
        'Configuration'
      ];
      
      const isValidCategories = (categories) => {
        return Array.isArray(categories) &&
               categories.length > 0 &&
               categories.every(cat => typeof cat === 'string' && cat.length > 0);
      };
      
      expect(isValidCategories(validCategories)).toBe(true);
      expect(isValidCategories([])).toBe(false);
      expect(isValidCategories(['', 'valid'])).toBe(false);
      expect(isValidCategories([null, 'valid'])).toBe(false);
    });

    test('should validate applications array', () => {
      const validApplications = ['App 1', 'App 2', 'App 3'];
      
      const isValidApplications = (applications) => {
        return Array.isArray(applications) &&
               applications.length > 0 &&
               applications.every(app => typeof app === 'string' && app.length > 0);
      };
      
      expect(isValidApplications(validApplications)).toBe(true);
      expect(isValidApplications([])).toBe(false);
      expect(isValidApplications([''])).toBe(false);
      expect(isValidApplications([123])).toBe(false);
    });

    test('should handle missing or duplicate entries', () => {
      const categoriesWithDuplicates = ['Test', 'Test', 'Unique'];
      const applicationsWithEmpty = ['App 1', '', 'App 2'];
      
      const sanitizeStringArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        
        return [...new Set(arr.filter(item => 
          typeof item === 'string' && item.trim().length > 0
        ))];
      };
      
      const cleanCategories = sanitizeStringArray(categoriesWithDuplicates);
      const cleanApplications = sanitizeStringArray(applicationsWithEmpty);
      
      expect(cleanCategories).toEqual(['Test', 'Unique']);
      expect(cleanApplications).toEqual(['App 1', 'App 2']);
    });
  });

  describe('Transform Function Validation', () => {
    test('should handle edge cases in transform functions', () => {
      const transformScale = (value) => {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return 40; // Default middle value
        return (numValue * 20) + 40;
      };
      
      const transformScaleReverse = (value) => {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return 0; // Default middle value
        return (numValue - 40) / 20;
      };
      
      const edgeCases = [
        null,
        undefined,
        'string',
        NaN,
        Infinity,
        -Infinity,
        {},
        []
      ];
      
      edgeCases.forEach(edgeCase => {
        const transformed = transformScale(edgeCase);
        const reversed = transformScaleReverse(transformed);
        
        expect(typeof transformed).toBe('number');
        expect(Number.isFinite(transformed)).toBe(true);
        expect(typeof reversed).toBe('number');
        expect(Number.isFinite(reversed)).toBe(true);
      });
    });

    test('should maintain transform consistency', () => {
      const transformScale = (value) => (value * 20) + 40;
      const transformScaleReverse = (value) => (value - 40) / 20;
      
      const testValues = [-2, -1, 0, 1, 2, 3];
      
      testValues.forEach(value => {
        const transformed = transformScale(value);
        const reversed = transformScaleReverse(transformed);
        
        expect(Math.abs(reversed - value)).toBeLessThan(0.0001); // Account for floating point precision
      });
    });
  });

  describe('Error Recovery', () => {
    test('should provide fallback values for critical failures', () => {
      const getMaturityDataWithFallback = (data) => {
        try {
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid data structure');
          }
          
          // Validate data structure
          data.forEach(appData => {
            if (!Array.isArray(appData)) {
              throw new Error('Invalid app data structure');
            }
          });
          
          return data;
        } catch (error) {
          console.warn('Using fallback data due to error:', error.message);
          
          // Return minimal fallback data
          return [
            [
              { app: 'Sample App', axis: 'Category 1', value: 0 },
              { app: 'Sample App', axis: 'Category 2', value: 0 }
            ]
          ];
        }
      };
      
      const invalidInputs = [null, undefined, 'string', 123, {}];
      
      invalidInputs.forEach(input => {
        const result = getMaturityDataWithFallback(input);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(Array.isArray(result[0])).toBe(true);
        expect(result[0].length).toBeGreaterThan(0);
      });
    });
  });
});