/**
 * Performance Monitoring Utility
 * Tracks and reports application performance metrics
 */

/**
 * Performance metrics storage
 */
let performanceMetrics = {
    pageLoad: {},
    chartRender: {},
    dataLoad: {},
    userInteractions: [],
    errors: []
};

/**
 * Mark performance timing
 */
function markTiming(name, type = 'mark') {
    if (performance && performance.mark) {
        const markName = `${name}-${type}`;
        performance.mark(markName);
        return markName;
    }
    return null;
}

/**
 * Measure performance between two marks
 */
function measureTiming(name, startMark, endMark) {
    if (performance && performance.measure) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name, 'measure')[0];
            return measure.duration;
        } catch (error) {
            console.warn('Performance measurement failed:', error);
            return null;
        }
    }
    return null;
}

/**
 * Track page load performance
 */
function trackPageLoad() {
    if (performance && performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
            performanceMetrics.pageLoad = {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                request: navigation.responseStart - navigation.requestStart,
                response: navigation.responseEnd - navigation.responseStart,
                domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                load: navigation.loadEventEnd - navigation.loadEventStart,
                total: navigation.loadEventEnd - navigation.navigationStart
            };
            
            console.log('Page load performance:', performanceMetrics.pageLoad);
        }
    }
}

/**
 * Track chart rendering performance
 */
function trackChartRender(chartId, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.chartRender[chartId] = {
        duration: duration,
        timestamp: endTime
    };
    
    console.log(`Chart render performance (${chartId}): ${duration.toFixed(2)}ms`);
    
    // Log warning for slow renders
    if (duration > 100) {
        console.warn(`Slow chart render detected: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
}

/**
 * Track data loading performance
 */
function trackDataLoad(dataSource, startTime, success = true, error = null) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.dataLoad[dataSource] = {
        duration: duration,
        timestamp: endTime,
        success: success,
        error: error
    };
    
    console.log(`Data load performance (${dataSource}): ${duration.toFixed(2)}ms - ${success ? 'Success' : 'Failed'}`);
    
    if (!success && error) {
        console.error(`Data load error (${dataSource}):`, error);
    }
    
    return duration;
}

/**
 * Track user interactions
 */
function trackUserInteraction(action, element, details = {}) {
    const interaction = {
        action: action,
        element: element,
        timestamp: performance.now(),
        details: details
    };
    
    performanceMetrics.userInteractions.push(interaction);
    
    // Keep only last 50 interactions
    if (performanceMetrics.userInteractions.length > 50) {
        performanceMetrics.userInteractions = performanceMetrics.userInteractions.slice(-50);
    }
    
    console.log('User interaction:', interaction);
}

/**
 * Track errors
 */
function trackError(error, context = '') {
    const errorInfo = {
        message: error.message || error,
        stack: error.stack || '',
        context: context,
        timestamp: performance.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    performanceMetrics.errors.push(errorInfo);
    
    // Keep only last 20 errors
    if (performanceMetrics.errors.length > 20) {
        performanceMetrics.errors = performanceMetrics.errors.slice(-20);
    }
    
    console.error('Error tracked:', errorInfo);
}

/**
 * Get Core Web Vitals
 */
function getCoreWebVitals() {
    return new Promise((resolve) => {
        const vitals = {};
        
        // Get FCP (First Contentful Paint)
        if (performance && performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
                vitals.fcp = fcpEntry.startTime;
            }
        }
        
        // Get LCP (Largest Contentful Paint) if available
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    vitals.lcp = lastEntry.startTime;
                    observer.disconnect();
                    resolve(vitals);
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                
                // Fallback timeout
                setTimeout(() => {
                    observer.disconnect();
                    resolve(vitals);
                }, 5000);
            } catch (error) {
                console.warn('LCP observation failed:', error);
                resolve(vitals);
            }
        } else {
            resolve(vitals);
        }
    });
}

/**
 * Monitor memory usage
 */
function monitorMemoryUsage() {
    if (performance && performance.memory) {
        const memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
            timestamp: performance.now()
        };
        
        console.log('Memory usage:', memory);
        
        // Warn if memory usage is high
        if (memory.used > 50) {
            console.warn(`High memory usage: ${memory.used}MB`);
        }
        
        return memory;
    }
    return null;
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
    const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: { ...performanceMetrics },
        memory: monitorMemoryUsage(),
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt
        } : null
    };
    
    console.log('Performance report:', report);
    return report;
}

/**
 * Setup automatic performance monitoring
 */
function setupPerformanceMonitoring() {
    // Track page load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageLoad);
    } else {
        trackPageLoad();
    }
    
    // Monitor memory usage periodically
    setInterval(monitorMemoryUsage, 60000); // Every minute
    
    // Track unhandled errors
    window.addEventListener('error', (event) => {
        trackError(event.error || event.message, 'unhandled error');
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        trackError(event.reason, 'unhandled promise rejection');
    });
    
    // Get Core Web Vitals
    getCoreWebVitals().then(vitals => {
        console.log('Core Web Vitals:', vitals);
        performanceMetrics.coreWebVitals = vitals;
    });
    
    console.log('Performance monitoring initialized');
}

/**
 * Show performance metrics in console (for debugging)
 */
function showPerformanceMetrics() {
    console.group('Performance Metrics');
    console.log('Page Load:', performanceMetrics.pageLoad);
    console.log('Chart Render:', performanceMetrics.chartRender);
    console.log('Data Load:', performanceMetrics.dataLoad);
    console.log('Recent Interactions:', performanceMetrics.userInteractions.slice(-10));
    console.log('Recent Errors:', performanceMetrics.errors.slice(-5));
    console.log('Memory:', monitorMemoryUsage());
    console.groupEnd();
}

// Add to window for debugging access
if (typeof window !== 'undefined') {
    window.performanceMetrics = performanceMetrics;
    window.showPerformanceMetrics = showPerformanceMetrics;
}

// ES Module exports
export {
    markTiming,
    measureTiming,
    trackPageLoad,
    trackChartRender,
    trackDataLoad,
    trackUserInteraction,
    trackError,
    getCoreWebVitals,
    monitorMemoryUsage,
    generatePerformanceReport,
    setupPerformanceMonitoring,
    showPerformanceMetrics,
    performanceMetrics
};

export default {
    markTiming,
    measureTiming,
    trackPageLoad,
    trackChartRender,
    trackDataLoad,
    trackUserInteraction,
    trackError,
    getCoreWebVitals,
    monitorMemoryUsage,
    generatePerformanceReport,
    setupPerformanceMonitoring,
    showPerformanceMetrics,
    performanceMetrics
};