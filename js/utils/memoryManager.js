/**
 * Memory Management Utility
 * Prevents memory leaks and manages resources for long-running sessions
 */

"use strict";

// Track active resources to prevent memory leaks
let activeResources = {
    eventListeners: new Set(),
    timers: new Set(),
    d3Selections: new Set(),
    domReferences: new WeakSet()
};

/**
 * Enhanced addEventListener that tracks listeners for cleanup
 */
function addManagedEventListener(element, event, handler, options = false) {
    element.addEventListener(event, handler, options);
    
    const listenerInfo = {
        element,
        event,
        handler,
        options
    };
    
    activeResources.eventListeners.add(listenerInfo);
    
    return listenerInfo;
}

/**
 * Remove a managed event listener
 */
function removeManagedEventListener(listenerInfo) {
    const { element, event, handler, options } = listenerInfo;
    element.removeEventListener(event, handler, options);
    activeResources.eventListeners.delete(listenerInfo);
}

/**
 * Enhanced setTimeout that tracks timers for cleanup
 */
function addManagedTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        activeResources.timers.delete(timeoutId);
        callback();
    }, delay);
    
    activeResources.timers.add(timeoutId);
    return timeoutId;
}

/**
 * Enhanced setInterval that tracks intervals for cleanup
 */
function addManagedInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    activeResources.timers.add(intervalId);
    return intervalId;
}

/**
 * Clear a managed timer
 */
function clearManagedTimer(timerId) {
    clearTimeout(timerId);
    clearInterval(timerId);
    activeResources.timers.delete(timerId);
}

/**
 * Track D3 selections for cleanup
 */
function trackD3Selection(selection, identifier) {
    const selectionInfo = {
        selection,
        identifier,
        timestamp: Date.now()
    };
    
    activeResources.d3Selections.add(selectionInfo);
    return selectionInfo;
}

/**
 * Clean up D3 selections and remove event listeners
 */
function cleanupD3Selection(selectionInfo) {
    if (selectionInfo && selectionInfo.selection) {
        try {
            // Remove D3 event listeners
            selectionInfo.selection.on('.memory-manager', null);
            
            // Clear selection reference
            selectionInfo.selection = null;
            
            activeResources.d3Selections.delete(selectionInfo);
        } catch (error) {
            console.warn('Error cleaning up D3 selection:', error);
        }
    }
}

/**
 * Clean up all D3 selections older than specified age
 */
function cleanupOldD3Selections(maxAge = 300000) { // 5 minutes default
    const cutoff = Date.now() - maxAge;
    
    activeResources.d3Selections.forEach(selectionInfo => {
        if (selectionInfo.timestamp < cutoff) {
            cleanupD3Selection(selectionInfo);
        }
    });
}

/**
 * Clean up DOM references and event listeners
 */
function cleanupDOMReferences() {
    // Clean up orphaned DOM event listeners
    activeResources.eventListeners.forEach(listenerInfo => {
        if (!(listenerInfo.element instanceof Node) || !document.contains(listenerInfo.element)) {
            removeManagedEventListener(listenerInfo);
        }
    });
}

/**
 * Force garbage collection of circular references
 */
function breakCircularReferences(obj, visited = new WeakSet()) {
    if (obj === null || typeof obj !== 'object' || visited.has(obj)) {
        return;
    }
    
    visited.add(obj);
    
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
            breakCircularReferences(obj[key], visited);
        }
    });
}

/**
 * Clean up all managed resources
 */
function cleanupAllResources() {
    // Clear all timers
    activeResources.timers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
    });
    activeResources.timers.clear();
    
    // Remove all event listeners
    activeResources.eventListeners.forEach(listenerInfo => {
        removeManagedEventListener(listenerInfo);
    });
    
    // Clean up D3 selections
    activeResources.d3Selections.forEach(selectionInfo => {
        cleanupD3Selection(selectionInfo);
    });
    activeResources.d3Selections.clear();
    
    // Clear DOM references
    cleanupDOMReferences();
    
    console.log('Memory cleanup completed');
}

/**
 * Monitor memory usage and trigger cleanup when needed
 */
function startMemoryMonitoring(options = {}) {
    const {
        checkInterval = 60000, // 1 minute
        memoryThreshold = 50 * 1024 * 1024, // 50MB
        d3CleanupAge = 300000 // 5 minutes
    } = options;
    
    const monitoringInterval = addManagedInterval(() => {
        // Clean up old D3 selections
        cleanupOldD3Selections(d3CleanupAge);
        
        // Clean up orphaned DOM references
        cleanupDOMReferences();
        
        // Check memory usage if available
        if (performance.memory) {
            const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
            
            if (usedJSHeapSize > memoryThreshold) {
                console.warn(`High memory usage detected: ${Math.round(usedJSHeapSize / 1024 / 1024)}MB`);
                
                // Trigger more aggressive cleanup
                cleanupOldD3Selections(d3CleanupAge / 2);
                
                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }
            }
            
            // Log memory stats periodically (only in debug mode)
            if (window.location.search.includes('debug=memory')) {
                console.log(`Memory: ${Math.round(usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(totalJSHeapSize / 1024 / 1024)}MB`);
                console.log(`Active resources: ${activeResources.eventListeners.size} listeners, ${activeResources.timers.size} timers, ${activeResources.d3Selections.size} D3 selections`);
            }
        }
    }, checkInterval);
    
    return monitoringInterval;
}

/**
 * Enhanced chart cleanup function for D3 radar charts
 */
function cleanupChart(containerId) {
    const container = document.getElementById(containerId.replace('#', ''));
    if (!container) return;

    // Remove all child elements (and their event listeners) via DOM API.
    // D3 bindigns are on the SVG elements themselves — removing them from the
    // DOM is sufficient; no d3 import needed in this utility module.
    container.textContent = '';

    // Clean up related D3 selections tracked by memoryManager
    activeResources.d3Selections.forEach(selectionInfo => {
        if (selectionInfo.identifier && selectionInfo.identifier.includes(containerId)) {
            cleanupD3Selection(selectionInfo);
        }
    });
}

/**
 * Get current memory usage statistics
 */
function getMemoryStats() {
    const stats = {
        eventListeners: activeResources.eventListeners.size,
        timers: activeResources.timers.size,
        d3Selections: activeResources.d3Selections.size,
        browserMemory: null
    };
    
    if (performance.memory) {
        stats.browserMemory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }
    
    return stats;
}

/**
 * Setup page unload cleanup
 */
function setupPageUnloadCleanup() {
    const cleanup = () => {
        cleanupAllResources();
    };
    
    // Use pagehide instead of deprecated unload event
    addManagedEventListener(window, 'pagehide', cleanup);
    
    // Handle page visibility changes (mobile/tablet and modern cleanup)
    addManagedEventListener(document, 'visibilitychange', () => {
        if (document.hidden) {
            // Cleanup when page becomes hidden
            cleanupOldD3Selections(60000); // Clean up D3 selections older than 1 minute
            cleanupDOMReferences();
        }
    });
    
    // Optional: Keep beforeunload for critical cleanup (not deprecated)
    // but only use it for truly critical operations
    addManagedEventListener(window, 'beforeunload', () => {
        // Only cleanup the most critical resources
        cleanupDOMReferences();
    });
}

// ES Module exports
export {
    addManagedEventListener,
    removeManagedEventListener,
    addManagedTimeout,
    addManagedInterval,
    clearManagedTimer,
    trackD3Selection,
    cleanupD3Selection,
    cleanupOldD3Selections,
    cleanupChart,
    cleanupAllResources,
    startMemoryMonitoring,
    getMemoryStats,
    setupPageUnloadCleanup,
    cleanupDOMReferences,
    breakCircularReferences
};

export default {
    addManagedEventListener,
    removeManagedEventListener,
    addManagedTimeout,
    addManagedInterval,
    clearManagedTimer,
    trackD3Selection,
    cleanupD3Selection,
    cleanupOldD3Selections,
    cleanupChart,
    cleanupAllResources,
    startMemoryMonitoring,
    getMemoryStats,
    setupPageUnloadCleanup,
    cleanupDOMReferences,
    breakCircularReferences
};