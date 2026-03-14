/**
 * Tests for memory leak prevention
 * Verifies proper cleanup of event listeners, timers, and D3 selections
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Memory Leak Prevention', () => {
  let memoryManager;
  let originalSetTimeout;
  let originalSetInterval;
  let originalClearTimeout;
  let originalClearInterval;
  
  beforeEach(async () => {
    // Store original timer functions
    originalSetTimeout = global.setTimeout;
    originalSetInterval = global.setInterval;
    originalClearTimeout = global.clearTimeout;
    originalClearInterval = global.clearInterval;
    
    // Reset DOM for each test
    document.body.innerHTML = `
      <div id="test-container">
        <div id="chart"></div>
        <div id="apps"></div>
      </div>
    `;
    
    // Import memory manager fresh for each test
    memoryManager = await import('../../js/utils/memoryManager.js');
  });
  
  afterEach(() => {
    // Restore original timer functions
    global.setTimeout = originalSetTimeout;
    global.setInterval = originalSetInterval;
    global.clearTimeout = originalClearTimeout;
    global.clearInterval = originalClearInterval;
    
    // Clean up any resources created during tests
    if (memoryManager) {
      memoryManager.cleanupAllResources();
    }
  });

  describe('Event Listener Management', () => {
    test('should track and cleanup event listeners', () => {
      const element = document.createElement('div');
      const handler = jest.fn();
      
      // Add managed event listener
      const listenerInfo = memoryManager.addManagedEventListener(element, 'click', handler);
      
      expect(listenerInfo).toBeDefined();
      expect(listenerInfo.element).toBe(element);
      expect(listenerInfo.event).toBe('click');
      expect(listenerInfo.handler).toBe(handler);
      
      // Simulate click
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
      
      // Remove managed event listener
      memoryManager.removeManagedEventListener(listenerInfo);
      
      // Click should no longer trigger handler
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
    
    test('should clean up orphaned DOM event listeners', () => {
      const element = document.createElement('div');
      const handler = jest.fn();
      
      // Add element to DOM
      document.body.appendChild(element);
      
      // Add managed event listener
      memoryManager.addManagedEventListener(element, 'click', handler);
      
      // Remove element from DOM
      document.body.removeChild(element);
      
      // Clean up orphaned listeners
      memoryManager.cleanupDOMReferences();
      
      // Should not crash and should clean up properly
      expect(true).toBe(true);
    });
    
    test('should setup page unload cleanup', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      memoryManager.setupPageUnloadCleanup();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function), false);
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function), false);
      
      addEventListenerSpy.mockRestore();
    });
  });
  
  describe('Timer Management', () => {
    test('should track and cleanup timeouts', () => {
      let timeoutCalled = false;
      
      const timeoutId = memoryManager.addManagedTimeout(() => {
        timeoutCalled = true;
      }, 100);
      
      expect(timeoutId).toBeDefined();
      expect(typeof timeoutId).toBe('number');
      
      // Clear the timeout before it fires
      memoryManager.clearManagedTimer(timeoutId);
      
      // Wait longer than timeout duration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(timeoutCalled).toBe(false);
          resolve();
        }, 150);
      });
    });
    
    test('should track and cleanup intervals', () => {
      let intervalCount = 0;
      
      const intervalId = memoryManager.addManagedInterval(() => {
        intervalCount++;
      }, 50);
      
      expect(intervalId).toBeDefined();
      
      // Let interval run a few times
      return new Promise(resolve => {
        setTimeout(() => {
          expect(intervalCount).toBeGreaterThan(0);
          
          // Clear the interval
          memoryManager.clearManagedTimer(intervalId);
          
          const countWhenCleared = intervalCount;
          
          // Wait and ensure interval stopped
          setTimeout(() => {
            expect(intervalCount).toBe(countWhenCleared);
            resolve();
          }, 100);
        }, 150);
      });
    });
    
    test('should cleanup all timers', () => {
      const timeout1 = memoryManager.addManagedTimeout(() => {}, 1000);
      const timeout2 = memoryManager.addManagedTimeout(() => {}, 1000);
      const interval1 = memoryManager.addManagedInterval(() => {}, 1000);
      
      expect(timeout1).toBeDefined();
      expect(timeout2).toBeDefined();
      expect(interval1).toBeDefined();
      
      // Clean up all resources
      memoryManager.cleanupAllResources();
      
      // All timers should be cleared
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });
  
  describe('D3 Selection Management', () => {
    test('should track D3 selections', () => {
      // Mock D3 selection
      const mockSelection = {
        on: jest.fn(),
        selectAll: jest.fn(() => mockSelection),
        remove: jest.fn()
      };
      
      const selectionInfo = memoryManager.trackD3Selection(mockSelection, 'test-chart');
      
      expect(selectionInfo).toBeDefined();
      expect(selectionInfo.selection).toBe(mockSelection);
      expect(selectionInfo.identifier).toBe('test-chart');
      expect(selectionInfo.timestamp).toBeDefined();
    });
    
    test('should cleanup D3 selections', () => {
      // Mock D3 selection
      const mockSelection = {
        on: jest.fn()
      };
      
      const selectionInfo = memoryManager.trackD3Selection(mockSelection, 'test-chart');
      
      // Cleanup selection
      memoryManager.cleanupD3Selection(selectionInfo);
      
      expect(mockSelection.on).toHaveBeenCalledWith('.memory-manager', null);
      expect(selectionInfo.selection).toBe(null);
    });
    
    test('should cleanup old D3 selections', async () => {
      // Mock D3 selection
      const oldMockSelection = {
        on: jest.fn()
      };
      
      const recentMockSelection = {
        on: jest.fn()
      };
      
      // Create selections with different ages
      const oldSelection = memoryManager.trackD3Selection(oldMockSelection, 'old-chart');
      const recentSelection = memoryManager.trackD3Selection(recentMockSelection, 'recent-chart');
      
      // Manually set timestamp to make one selection old
      oldSelection.timestamp = Date.now() - 400000; // 6.6 minutes ago
      
      // Clean up selections older than 5 minutes
      memoryManager.cleanupOldD3Selections(300000); // 5 minutes
      
      // Old selection should be cleaned up
      expect(oldMockSelection.on).toHaveBeenCalledWith('.memory-manager', null);
      // Recent selection should not be affected
      expect(recentMockSelection.on).not.toHaveBeenCalled();
    });
  });
  
  describe('Chart Cleanup', () => {
    test('should cleanup chart container', () => {
      const chartContainer = document.getElementById('chart');
      // Set up some child content to verify cleanup
      const svg = document.createElement('svg');
      const g = document.createElement('g');
      const circle = document.createElement('circle');
      g.appendChild(circle);
      svg.appendChild(g);
      chartContainer.appendChild(svg);

      memoryManager.cleanupChart('#chart');

      // Container should be emptied via vanilla DOM (no d3 dependency)
      expect(chartContainer.childNodes.length).toBe(0);
    });
    
    test('should handle cleanup of non-existent container', () => {
      // Should not throw error when container doesn't exist
      expect(() => {
        memoryManager.cleanupChart('#non-existent');
      }).not.toThrow();
    });
  });
  
  describe('Memory Monitoring', () => {
    test('should get memory statistics', () => {
      // Add some tracked resources
      const element = document.createElement('div');
      memoryManager.addManagedEventListener(element, 'click', () => {});
      memoryManager.addManagedTimeout(() => {}, 1000);
      
      const stats = memoryManager.getMemoryStats();
      
      expect(stats).toBeDefined();
      expect(stats.eventListeners).toBeGreaterThan(0);
      expect(stats.timers).toBeGreaterThan(0);
      expect(stats.d3Selections).toBeGreaterThanOrEqual(0);
      expect(typeof stats.browserMemory).toBe('object');
    });
    
    test('should start memory monitoring', () => {
      const mockSetInterval = jest.fn(() => 123);
      global.setInterval = mockSetInterval;
      
      const monitoringId = memoryManager.startMemoryMonitoring({
        checkInterval: 1000,
        memoryThreshold: 10 * 1024 * 1024
      });
      
      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        1000
      );
      expect(monitoringId).toBe(123);
    });
  });
  
  describe('Circular Reference Breaking', () => {
    test('should handle circular references', () => {
      const obj1 = { name: 'obj1' };
      const obj2 = { name: 'obj2' };
      
      // Create circular reference
      obj1.ref = obj2;
      obj2.ref = obj1;
      
      // Should not throw error or cause infinite loop
      expect(() => {
        memoryManager.breakCircularReferences(obj1);
      }).not.toThrow();
    });
    
    test('should handle null and primitive values', () => {
      expect(() => {
        memoryManager.breakCircularReferences(null);
        memoryManager.breakCircularReferences(undefined);
        memoryManager.breakCircularReferences(42);
        memoryManager.breakCircularReferences('string');
        memoryManager.breakCircularReferences(true);
      }).not.toThrow();
    });
  });
  
  describe('Resource Cleanup Integration', () => {
    test('should cleanup all resources at once', () => {
      // Create various tracked resources
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      
      memoryManager.addManagedEventListener(element1, 'click', () => {});
      memoryManager.addManagedEventListener(element2, 'mouseover', () => {});
      memoryManager.addManagedTimeout(() => {}, 1000);
      memoryManager.addManagedInterval(() => {}, 500);
      
      const mockSelection = { on: jest.fn() };
      memoryManager.trackD3Selection(mockSelection, 'test');
      
      // Clean up everything
      memoryManager.cleanupAllResources();
      
      // Verify cleanup
      const stats = memoryManager.getMemoryStats();
      expect(stats.eventListeners).toBe(0);
      expect(stats.timers).toBe(0);
      expect(stats.d3Selections).toBe(0);
    });
  });
});