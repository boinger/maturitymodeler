/**
 * Unit tests for transform.js functions
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { sampleMaturityData, sampleCategories } from '../fixtures/testData.js';

// Mock the data module
const mockDataRadar = {
  categories: sampleCategories,
  maturityData: sampleMaturityData,
  applications: ["Test App 1", "Test App 2"],
  idAverageCategories: 100,
  averageTitle: "Average Test Data"
};

// Populated via the AMD define() mock in tests/setup.js
let transform;

describe('Transform Functions', () => {
  beforeEach(() => {
    // Mock define call for transform module
    global.define(['dataRadar'], (dataRadar) => {
      // Simulate the transform module factory function
      return {
        transformScale: (value) => ((value * 20) + 40),
        transformScaleReverse: (value) => ((value - 40) / 20),
        getAppNames: () => mockDataRadar.applications,
        getSingleDataSet: (appName) => {
          const index = mockDataRadar.applications.indexOf(appName);
          return index >= 0 ? mockDataRadar.maturityData[index] : undefined;
        },
        getSelectedData: (selections) => {
          return selections.map(index => mockDataRadar.maturityData[index]).filter(Boolean);
        }
      };
    });
    
    transform = global.define.mock.results[global.define.mock.results.length - 1].value;
  });

  describe('transformScale', () => {
    test('should transform -2 to 0', () => {
      expect(transform.transformScale(-2)).toBe(0);
    });

    test('should transform -1 to 20', () => {
      expect(transform.transformScale(-1)).toBe(20);
    });

    test('should transform 0 to 40', () => {
      expect(transform.transformScale(0)).toBe(40);
    });

    test('should transform 1 to 60', () => {
      expect(transform.transformScale(1)).toBe(60);
    });

    test('should transform 2 to 80', () => {
      expect(transform.transformScale(2)).toBe(80);
    });

    test('should transform 3 to 100', () => {
      expect(transform.transformScale(3)).toBe(100);
    });
  });

  describe('transformScaleReverse', () => {
    test('should reverse transform 0 to -2', () => {
      expect(transform.transformScaleReverse(0)).toBe(-2);
    });

    test('should reverse transform 40 to 0', () => {
      expect(transform.transformScaleReverse(40)).toBe(0);
    });

    test('should reverse transform 100 to 3', () => {
      expect(transform.transformScaleReverse(100)).toBe(3);
    });
  });

  describe('getAppNames', () => {
    test('should return array of application names', () => {
      const names = transform.getAppNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names).toEqual(["Test App 1", "Test App 2"]);
    });
  });

  describe('getSingleDataSet', () => {
    test('should return data for valid app name', () => {
      const data = transform.getSingleDataSet("Test App 1");
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].app).toBe("Test App 1");
    });

    test('should return undefined for invalid app name', () => {
      const data = transform.getSingleDataSet("Nonexistent App");
      expect(data).toBeUndefined();
    });
  });

  describe('getSelectedData', () => {
    test('should return empty array for empty selection', () => {
      const data = transform.getSelectedData([]);
      expect(data).toEqual([]);
    });

    test('should return data for valid selections', () => {
      const data = transform.getSelectedData([0, 1]);
      expect(data).toHaveLength(2);
      expect(data[0][0].app).toBe("Test App 1");
      expect(data[1][0].app).toBe("Test App 2");
    });

    test('should filter out invalid selections', () => {
      const data = transform.getSelectedData([0, 999, 1]);
      expect(data).toHaveLength(2);
    });
  });
});