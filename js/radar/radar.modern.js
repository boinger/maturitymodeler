/**
 * Modernized Radar Chart Implementation
 * 
 * LEGACY WRAPPER: This file now wraps the new SpiderChart class for backward compatibility.
 * All new development should use SpiderChart directly.
 * 
 * Original Created by Gary A. Stafford on 1/29/15
 * Modified by Jeff Vier beginning 7 Dec 2020
 * Modernized with SpiderChart class integration
 * https://github.com/boinger/maturitymodeler
 */

import SpiderChart from './SpiderChart.js';

"use strict";

// Global chart instance for backward compatibility
let currentChart = null;

/**
 * Legacy color array for backward compatibility
 */
const customColors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
    "#c49c94", "#f7b6d3", "#c7c7c7", "#dbdb8d", "#9edae5"
];

/**
 * Legacy color scale function for backward compatibility
 */
const sharedColorScale = (index) => customColors[index % customColors.length];

/**
 * Legacy draw function - now delegates to SpiderChart
 * 
 * @param {string} id - Container selector
 * @param {Array} data - Chart data
 * @param {Object} options - Chart options
 * @returns {SpiderChart} Chart instance
 */
const draw = (id, data, options = {}) => {
    try {
        // Clean up previous chart
        if (currentChart) {
            currentChart.destroy();
        }
        
        // Convert legacy options to new format
        const config = {
            ...options,
            color: options.color || sharedColorScale
        };
        
        // Create and render new chart
        currentChart = new SpiderChart(id, config);
        currentChart.render(data);
        
        console.log('Chart rendered successfully with modern SpiderChart implementation');
        return currentChart;
        
    } catch (error) {
        console.error('Chart rendering failed:', error);
        
        // Fallback to basic error display
        const container = document.querySelector(id);
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #d62728;">
                    <h3>Chart Rendering Error</h3>
                    <p>Unable to render the spider chart. Please check the data format.</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
        }
        
        return null;
    }
};

/**
 * Get the current chart instance
 * @returns {SpiderChart|null} Current chart instance
 */
const getCurrentChart = () => currentChart;

/**
 * Get the color scale function
 * @returns {Function} Color scale function
 */
const getColorScale = () => sharedColorScale;

/**
 * Clean up resources
 */
const cleanup = () => {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
};

// Backward compatibility: ensure cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', cleanup);
}

// ES Module exports
export { draw, sharedColorScale as getColorScale, getCurrentChart, cleanup };

// Default export for compatibility
export default {
    draw,
    getColorScale,
    getCurrentChart,
    cleanup
};