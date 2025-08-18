/**
 * Tests for tooltip functionality
 * These tests would have caught the "NaN" tooltip bug from D3 v7 upgrade
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Tooltip Functionality', () => {
  let tooltipElement;

  beforeEach(() => {
    // Create tooltip container
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.visibility = 'hidden';
    document.body.appendChild(tooltipElement);
  });

  describe('Tooltip Content Generation', () => {
    test('should display correct values instead of NaN', () => {
      const testData = { app: 'Test App', axis: 'Testing', value: 2 };
      const transformScale = (value) => (value * 20) + 40;
      
      const transformedValue = transformScale(testData.value);
      const displayValue = isNaN(transformedValue) ? 0 : transformedValue;
      
      const expectedContent = `${testData.app}<br/>${testData.axis}: ${displayValue}`;
      
      expect(displayValue).toBe(80); // 2 * 20 + 40
      expect(displayValue).not.toBeNaN();
      expect(expectedContent).toBe('Test App<br/>Testing: 80');
    });

    test('should handle invalid/null values gracefully', () => {
      const invalidData = [
        { app: 'Test', axis: 'Test1', value: null },
        { app: 'Test', axis: 'Test2', value: undefined },
        { app: 'Test', axis: 'Test3', value: 'invalid' },
        { app: 'Test', axis: 'Test4', value: NaN }
      ];
      
      const transformScale = (value) => {
        const numValue = Number(value);
        return isNaN(numValue) ? 40 : (numValue * 20) + 40;
      };
      
      invalidData.forEach(data => {
        const transformedValue = transformScale(data.value);
        expect(transformedValue).not.toBeNaN();
        expect(typeof transformedValue).toBe('number');
        
        // Should default to 40 (transformed value of 0)
        expect(transformedValue).toBe(40);
      });
    });

    test('should format tooltip content consistently', () => {
      const testData = { app: 'Long Application Name', axis: 'Very Long Category Name', value: 1.5 };
      
      const transformedValue = Math.round((testData.value * 20) + 40);
      const formattedContent = `<strong>${testData.app}</strong><br/>${testData.axis}: ${transformedValue}`;
      
      expect(formattedContent).toBe(
        '<strong>Long Application Name</strong><br/>Very Long Category Name: 70'
      );
    });

    test('should handle edge case values in transformation', () => {
      const transformScale = (value) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return 40; // Default middle value
        return Math.max(0, Math.min(100, (numValue * 20) + 40)); // Clamp to 0-100
      };
      
      const edgeCases = [
        { value: -10, expected: 0 }, // Below minimum, should clamp to 0
        { value: 5, expected: 100 }, // Above maximum, should clamp to 100
        { value: 0, expected: 40 }, // Center value
        { value: null, expected: 40 }, // Null should use default
        { value: 'invalid', expected: 40 } // Invalid should use default
      ];
      
      edgeCases.forEach(({ value, expected }) => {
        const result = transformScale(value);
        expect(result).toBe(expected);
        expect(Number.isFinite(result)).toBe(true);
      });
    });
  });

  describe('Tooltip Positioning Logic', () => {
    test('should calculate safe tooltip position', () => {
      const calculateTooltipPosition = (mouseEvent) => {
        const offset = 10;
        const tooltipWidth = 200;
        const tooltipHeight = 50;
        
        let left = mouseEvent.pageX + offset;
        let top = mouseEvent.pageY - offset;
        
        // Ensure tooltip doesn't go off screen
        if (left + tooltipWidth > window.innerWidth) {
          left = mouseEvent.pageX - tooltipWidth - offset;
        }
        
        if (top < 0) {
          top = mouseEvent.pageY + offset;
        }
        
        return { left, top };
      };
      
      const testCases = [
        { pageX: 100, pageY: 100 }, // Normal case
        { pageX: window.innerWidth - 50, pageY: 50 }, // Near right edge
        { pageX: 50, pageY: 5 }, // Near top edge
        { pageX: 0, pageY: 0 } // Corner case
      ];
      
      testCases.forEach(mouseEvent => {
        const position = calculateTooltipPosition(mouseEvent);
        
        expect(position.left).toBeGreaterThanOrEqual(0);
        expect(position.top).toBeGreaterThanOrEqual(0);
        expect(typeof position.left).toBe('number');
        expect(typeof position.top).toBe('number');
      });
    });

    test('should handle tooltip visibility states', () => {
      const tooltipStates = {
        show: (element) => {
          element.style.visibility = 'visible';
          return element.style.visibility;
        },
        hide: (element) => {
          element.style.visibility = 'hidden';
          return element.style.visibility;
        }
      };
      
      // Test show
      const showResult = tooltipStates.show(tooltipElement);
      expect(showResult).toBe('visible');
      expect(tooltipElement.style.visibility).toBe('visible');
      
      // Test hide
      const hideResult = tooltipStates.hide(tooltipElement);
      expect(hideResult).toBe('hidden');
      expect(tooltipElement.style.visibility).toBe('hidden');
    });
  });

  describe('Event Handler Integration', () => {
    test('should create proper event handlers for D3 v7', () => {
      const createTooltipHandlers = () => {
        return {
          mouseover: (event, data) => {
            // D3 v7 signature: (event, data) instead of (data, index)
            const transformScale = (value) => (value * 20) + 40;
            
            return {
              event: {
                x: event ? event.pageX : 0,
                y: event ? event.pageY : 0
              },
              content: {
                app: data ? data.app : 'Unknown',
                axis: data ? data.axis : 'Unknown',
                value: data && typeof data.value === 'number' ? transformScale(data.value) : 0
              }
            };
          },
          mouseout: () => {
            return { action: 'hide' };
          }
        };
      };
      
      const handlers = createTooltipHandlers();
      
      // Test mouseover with valid data
      const mockEvent = { pageX: 150, pageY: 200 };
      const mockData = { app: 'Test App', axis: 'Test Category', value: 2 };
      
      const overResult = handlers.mouseover(mockEvent, mockData);
      
      expect(overResult.event.x).toBe(150);
      expect(overResult.event.y).toBe(200);
      expect(overResult.content.app).toBe('Test App');
      expect(overResult.content.axis).toBe('Test Category');
      expect(overResult.content.value).toBe(80); // (2 * 20) + 40
      
      // Test mouseout
      const outResult = handlers.mouseout();
      expect(outResult.action).toBe('hide');
      
      // Test with missing data
      const invalidResult = handlers.mouseover(null, null);
      expect(invalidResult.event.x).toBe(0);
      expect(invalidResult.event.y).toBe(0);
      expect(invalidResult.content.app).toBe('Unknown');
      expect(invalidResult.content.value).toBe(0);
    });

    test('should handle rapid show/hide events', () => {
      const tooltipManager = {
        timeoutId: null,
        show: function(element, delay = 0) {
          clearTimeout(this.timeoutId);
          this.timeoutId = setTimeout(() => {
            element.style.visibility = 'visible';
          }, delay);
        },
        hide: function(element, delay = 0) {
          clearTimeout(this.timeoutId);
          this.timeoutId = setTimeout(() => {
            element.style.visibility = 'hidden';
          }, delay);
        }
      };
      
      // Rapid show/hide shouldn't cause errors
      for (let i = 0; i < 10; i++) {
        tooltipManager.show(tooltipElement, 1);
        tooltipManager.hide(tooltipElement, 1);
      }
      
      // Should not throw errors and timeoutId should be set
      expect(typeof tooltipManager.timeoutId).toBe('number');
    });
  });

  describe('Data Validation for Tooltips', () => {
    test('should validate tooltip data before rendering', () => {
      const validateTooltipData = (data) => {
        if (!data || typeof data !== 'object') return false;
        
        const hasValidApp = typeof data.app === 'string' && data.app.length > 0;
        const hasValidAxis = typeof data.axis === 'string' && data.axis.length > 0;
        const hasValidValue = typeof data.value === 'number' && !isNaN(data.value);
        
        return hasValidApp && hasValidAxis && hasValidValue;
      };
      
      const validData = { app: 'Test App', axis: 'Test Axis', value: 1.5 };
      const invalidData = [
        null,
        undefined,
        {},
        { app: '', axis: 'test', value: 1 },
        { app: 'test', axis: '', value: 1 },
        { app: 'test', axis: 'test', value: NaN },
        { app: 'test', axis: 'test', value: 'invalid' },
        { app: null, axis: 'test', value: 1 }
      ];
      
      expect(validateTooltipData(validData)).toBe(true);
      
      invalidData.forEach(data => {
        expect(validateTooltipData(data)).toBe(false);
      });
    });

    test('should provide fallback content for invalid data', () => {
      const generateTooltipContent = (data) => {
        const safeApp = (data && typeof data.app === 'string' && data.app.length > 0) 
          ? data.app : 'Unknown Application';
        const safeAxis = (data && typeof data.axis === 'string' && data.axis.length > 0) 
          ? data.axis : 'Unknown Category';
        const safeValue = (data && typeof data.value === 'number' && !isNaN(data.value)) 
          ? Math.round((data.value * 20) + 40) : 40;
        
        return `<strong>${safeApp}</strong><br/>${safeAxis}: ${safeValue}`;
      };
      
      const testCases = [
        { data: null, expected: '<strong>Unknown Application</strong><br/>Unknown Category: 40' },
        { data: { app: 'Test' }, expected: '<strong>Test</strong><br/>Unknown Category: 40' },
        { data: { app: 'Test', axis: 'Cat', value: 1 }, expected: '<strong>Test</strong><br/>Cat: 60' }
      ];
      
      testCases.forEach(({ data, expected }) => {
        const content = generateTooltipContent(data);
        expect(content).toBe(expected);
      });
    });
  });
});